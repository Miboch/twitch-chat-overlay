import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {PrivMsgModel} from '../../models/priv-msg.model';
import {EmoteDataModel} from '../../models/emoteData.model';

@Component({
  selector: 'message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})

export class MessageComponent implements OnInit {
  message: PrivMsgModel
  @ViewChild('messageBucket') messageBucket: ElementRef<HTMLSpanElement>;


  constructor(private renderer: Renderer2) {
    this.message = {
      raw: "",
      badgeInfo: "",
      color: "#00aacc",
      displayName: "TwitchFan",
      userType: "This is the message what the user wanted to send..."
    }
  }

  // TODO: Fix ACTION tags. What the fuck is going on there
  // TODO: Fix highlighting of messages [new feature].
  // TODO: Fix emotes. They borked. The positions is an "array" of comma-separated start-ends, so id:start-end,start-end...
  // additionally, need to split the message based on emoteText,
  // join the message back together using grabEmoteUrl as the join operator

  ngOnInit(): void {
  }

  set updateMessage(message: PrivMsgModel) {
    this.message = message;
    // this.createEmotes(message);
  }

  // update message to add emotes
  createEmotes(message: PrivMsgModel) {
    if (!Boolean(message.emotes))
      return;
    console.log(message.emotes);
    let emotes = message.emotes.split("/").map(emoteString => {
      return {
        emoteId: emoteString.split(":")[0],
        start: Number(emoteString.split(":")[1].split("-")[0]),
        end: Number(emoteString.split(":")[1].split("-")[1]),
      } as EmoteDataModel
    });
    let newInnerValue = message.userType;
    emotes.forEach(emoteModel => {
      newInnerValue = newInnerValue.slice(0, emoteModel.start) + this.grabEmoteUrl(emoteModel.emoteId) + newInnerValue.slice(emoteModel.end + 1);
    })
    setTimeout(() => {
      this.renderer.setProperty(this.messageBucket.nativeElement, "innerHTML", newInnerValue)
    })
  }

  // grab each emote by id and return img tag
  grabEmoteUrl(emoteId: string) {
    return `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/2.0" alt="emotes lol" />`
  }

}
