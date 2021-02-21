import {Component, OnInit} from '@angular/core';
import {of, Subject} from 'rxjs';
import {PrivMsgModel} from './models/priv-msg.model';
import {ActivatedRoute, ActivatedRouteSnapshot, Router} from '@angular/router';
import {delay, repeat, switchMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'terminal-chat-overlay';
  justinfan = "justinfan1*********".split('').map(char => char === "*" ? Math.floor(Math.random() * 9) : char).join('');
  chatSocket: WebSocket;
  chatMessageProcessor: Subject<PrivMsgModel> = new Subject<PrivMsgModel>();
  channel = "#";

  constructor() {
    this.channel += (window.location.pathname.slice(1)).toLowerCase();
    this.chatMessageProcessor = new Subject<PrivMsgModel>();
  }


  ngOnInit() {
    // of("@badge-info=;badges=broadcaster/1;client-nonce=4457fa203a4974e3a7f1971c9487a969;color=#1E90FF;display-name=AccordingToBo;emotes=64138:26-34,36-44,46-54/123171:72-83/25:85-89;flags=;id=f797c26d-836f-428b-adc3-d9fa8575f6b4;mod=0;room-id=407018183;subscriber=0;tmi-sent-ts=1613878339826;turbo=0;user-id=407018183;user-type= :accordingtobo!accordingtobo@accordingtobo.tmi.twitch.tv PRIVMSG #accordingtobo :test message with emotes: SeemsGood SeemsGood SeemsGood and more emotes CoolStoryBob Kappa")
    //   .pipe(
    //     delay(100),
    //     tap(raw => this.processRawChatMessage(raw)),
    //     switchMap(raw => {
    //       return of(raw).pipe(delay(500), repeat())
    //     })
    //   ).subscribe(raw => {
    //   this.processRawChatMessage(raw);
    // })
    this.chatSocket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
    this.chatSocket.onopen = (evt) => {
      this.chatSocket.send(`NICK ${this.justinfan}`);
      this.chatSocket.send("CAP REQ :twitch.tv/tags");
      this.chatSocket.send(`JOIN ${this.channel}`);
    }
    this.chatSocket.onmessage = (msg) => {
      if(msg.data === "PING :tmi.twitch.tv") {
        this.chatSocket.send("PONG :tmi.twitch.tv")
      } else if(msg.data.indexOf("user-type= :") > -1) {
        this.processRawChatMessage(msg.data);
      }
    }
  }

  processRawChatMessage(msg: string) {
    let newPriv: PrivMsgModel = {
      raw: msg
    };
    const lines = msg.split(";").slice(0,15);
    lines.forEach(line => {
      let kvPair = this.processLine(line);
      Object.assign(newPriv, kvPair);
    });
    this.cleanValues(newPriv);
    this.chatMessageProcessor.next(newPriv);
  }

  processLine(line: string) {
    let [key, value] = line.split("=");
    key = this.cleanKey(key);
    let returnObject = {};
    returnObject[key] = value;
    return returnObject;
  }

  cleanKey(key: string): string {
    key = key.replace("@", "");
    key = key.split("-").reduce((key, part) => key += part.charAt(0).toUpperCase() + part.slice(1));
    return key;
  }

  cleanValues(priv: PrivMsgModel) {
    let message = priv.raw.split(";user-type=").slice(1);
    message[0] = message[0]?.slice(message[0].indexOf(`PRIVMSG ${this.channel} :`) + `PRIVMSG ${this.channel} :`.length);
    priv.userType = message.join("");
  }

}
