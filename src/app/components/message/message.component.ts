import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {PrivMsgModel} from '../../models/priv-msg.model';
import {EmoteDataModel} from '../../models/emoteData.model';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(100%)'}),
        animate('350ms', style({opacity: 1, transform: 'translateY(0)'}))
      ])
    ])
  ]
})

export class MessageComponent implements OnInit {
  @ViewChild('messageBucket') messageBucket: ElementRef<HTMLSpanElement>;
  message: PrivMsgModel;

  constructor(private renderer: Renderer2) {
  }

  // TODO: Fix ACTION tags. What the fuck is going on there
  // TODO: Fix highlighting of messages [new feature].

  ngOnInit(): void {
  }

  set updateMessage(message: PrivMsgModel) {
    this.message = message;
    this.createEmotes(message);
  }

  // update message to add emotes
  createEmotes(message: PrivMsgModel) {
    if (!Boolean(message.emotes))
      return;
    let emotes = message.emotes.split("/").map(emoteString => {
      let [id, ranges] = emoteString.split(":");
      let rangeArray = ranges.split(",");
      return {
        emoteId: id,
        rangePairs: rangeArray.map(rangeString => ({
          start: Number(rangeString.split("-")[0]),
          end: Number(rangeString.split("-")[1])
        }))
      } as EmoteDataModel
    });
    let newInnerValue = message.userType;
    emotes.forEach(emote => {
      emote.replaceString = message.userType.slice(emote.rangePairs[0].start, emote.rangePairs[0].end + 1);
      newInnerValue = newInnerValue.replaceAll(emote.replaceString, this.grabEmoteUrl(emote.emoteId))
    })
    setTimeout(() => {
      this.renderer.setProperty(this.messageBucket.nativeElement, "innerHTML", newInnerValue);
    }, 10)
  }

  // grab each emote by id and return img tag
  grabEmoteUrl(emoteId: string) {
    return `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/2.0" alt="emotes lol" />`
  }

}
