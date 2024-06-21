

const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

enum P2PChannelType {
    Mouse = 0,
}

export class P2P { 
    private _peerConnection: RTCPeerConnection;
    private _channel : P2PChannel[] = [];

    constructor(
        peerConnection : RTCPeerConnection,
        channels : P2PChannel[] = []
    ) {
        this._peerConnection = peerConnection;
    }
    
    static Create() : P2P
    { 
        const peerConnection = new RTCPeerConnection(configuration);
        return new P2P(peerConnection);
    }

    private CreateChannel(channelName : string) 
    { 
        const channel : RTCDataChannel = this._peerConnection.createDataChannel(channelName);
        const p2pChannel : P2PChannel = new P2PChannel(channel);
        this._channel.push(p2pChannel);

        return p2pChannel;
    }

    private createMouseChannel() { 
        const mouseChannel : P2PChannel = this.CreateChannel("mouse");
        mouseChannel.onMessage = (ev: MessageEvent) => { 
            console.log(ev.data);
        }
    }
}



export class P2PChannel 
{ 
    private _channel : RTCDataChannel;
    
    onBufferedAmountLow : ((this: P2PChannel, ev: Event) => any) | null = null;
    onClose : ((this: P2PChannel, ev: Event) => any) | null = null;
    onClosing : ((this: P2PChannel, ev: Event) => any) | null = null;
    onError : ((this: P2PChannel, ev: Event) => any) | null = null;
    onMessage : ((this: P2PChannel, ev: MessageEvent) => any) | null = null;
    onOpen : ((this: P2PChannel, ev: Event) => any) | null = null;

    constructor(channel : RTCDataChannel) {
        this._channel = channel;
        this._channel.onbufferedamountlow = (ev) => this.onBufferedAmountLow(ev);
        this._channel.onclose = (ev) => this.onClose(ev)
        this._channel.onclosing = (ev) => this.onClosing(ev);
        this._channel.onerror = (ev) => this.onError(ev);
        this._channel.onmessage = (ev) => this.onMessage(ev);
        this._channel.onopen = (ev) => this.onOpen(ev);
    }



}