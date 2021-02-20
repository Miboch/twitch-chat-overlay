import {
  ComponentFactory,
  ComponentFactoryResolver,
  Directive, Input,
  OnChanges,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import {MessageComponent} from '../components/message/message.component';
import {Observable, Subscription} from 'rxjs';
import {PrivMsgModel} from '../models/priv-msg.model';

@Directive({selector: '[messageOutlet]'})
export class MessageOutletDirective implements OnChanges {
  messageFactory: ComponentFactory<MessageComponent>
  messageSubscription: Subscription;
  @Input() messageOutlet: Observable<PrivMsgModel>;

  constructor(private vContainer: ViewContainerRef, private factory: ComponentFactoryResolver) {
    this.messageFactory = factory.resolveComponentFactory(MessageComponent);
    this.messageSubscription = new Subscription();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if('messageOutlet' in changes) {
      this.resubscribe();
    }
  }

  resubscribe():void {
    this.messageSubscription.unsubscribe();
    this.messageSubscription = this.messageOutlet.subscribe(message => {
      this.createMessage(message);
    })
  }

  createMessage(msg: PrivMsgModel): void {
    const component = this.vContainer.createComponent(this.messageFactory);
    component.instance.updateMessage = msg;
  }


}
