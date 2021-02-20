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
    // of("@badge-info=;badges=broadcaster/1;client-nonce=3359f1962e5bec9f97a349dc514572da;color=#1E90FF;display-name=AccordingToBo;emotes=;flags=;id=219d18ea-1306-4cf2-9a1a-cf827a275b1c;mod=0;room-id=407018183;subscriber=0;tmi-sent-ts=1613816551759;turbo=0;user-id=407018183;user-type= :accordingtobo!accordingtobo@accordingtobo.tmi.twitch.tv PRIVMSG #accordingtobo :lets try that one more time shall we;;;;;; there is more text after this ;user-type= even more text!")
    //   .pipe(
    //     delay(100),
    //     tap(raw => this.processRawChatMessage(raw)),
    //     switchMap(raw => {
    //       return of(raw).pipe(delay(6000), repeat())
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
    message[0] = message[0]?.slice(message[0].indexOf("PRIVMSG #accordingtobo :") + "PRIVMSG #accordingtobo :".length);
    priv.userType = message.join("");
  }

}
