

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

enum P2PChannelType {
  Mouse = 0,
}

export class P2PServer {
  private _server: RTCPeerConnection;
  private _sendChannel: RTCDataChannel;
  constructor();
  constructor(configuration?: RTCConfiguration) {
    const server = new RTCPeerConnection(configuration);

    const sendChannelOptions: RTCDataChannelInit = {
      ordered: true,
      maxPacketLifeTime: 3000
    };

    const sendChannel = server.createDataChannel(
      "send",
      sendChannelOptions);
    sendChannel.onopen = this.onSendChannelOpen;
    sendChannel.close = this.onSendChannelClose;


    server.onicecandidate = this.onIceCandidate;

    this._server = server;
  }

  sendData() {
    this._sendChannel.send("Hello World");
  }

  onIceCandidate(e: RTCPeerConnectionIceEvent) {

  }

  private onSendChannelOpen() {

  }
  private onSendChannelClose() {
    this._server.close();
    this._server = null;
  }

}

export class P2PChannel {
  private _channel: RTCDataChannel;

  onBufferedAmountLow: ((this: P2PChannel, ev: Event) => any) | null = null;
  onClose: ((this: P2PChannel, ev: Event) => any) | null = null;
  onClosing: ((this: P2PChannel, ev: Event) => any) | null = null;
  onError: ((this: P2PChannel, ev: Event) => any) | null = null;
  onMessage: ((this: P2PChannel, ev: MessageEvent) => any) | null = null;
  onOpen: ((this: P2PChannel, ev: Event) => any) | null = null;

  constructor(channel: RTCDataChannel) {
    this._channel = channel;
    this._channel.onbufferedamountlow = (ev) => this.onBufferedAmountLow(ev);
    this._channel.onclose = (ev) => this.onClose(ev);
    this._channel.onclosing = (ev) => this.onClosing(ev);
    this._channel.onerror = (ev) => this.onError(ev);
    this._channel.onmessage = (ev) => this.onMessage(ev);
    this._channel.onopen = (ev) => this.onOpen(ev);
  }

}