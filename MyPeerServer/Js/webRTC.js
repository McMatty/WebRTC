var MyWebRTC = function (destinationID, serverCallback, onOpen) {
    
    if (!serverCallback) {
        console.log('No server callback function found');
    }
    
    var pc_constraints = { optional: [{ DtlsSrtpKeyAgreement: true }, { RtpDataChannels: true }] };
    
    var servers = {
        'iceServers': [{ url: 'stun:stun01.sipphone.com' },
                        { url: 'stun:stun.ekiga.net' },
                        { url: 'stun:stun.fwdnet.net' },
                        { url: 'stun:stun.ideasip.com' },
                        { url: 'stun:stun.iptel.org' },
                        { url: 'stun:stun.rixtelecom.se' },
                        { url: 'stun:stun.schlund.de' },
                        { url: 'stun:stun.l.google.com:19302' },
                        { url: 'stun:stun1.l.google.com:19302' },
                        { url: 'stun:stun2.l.google.com:19302' },
                        { url: 'stun:stun3.l.google.com:19302' },
                        { url: 'stun:stun4.l.google.com:19302' },
                        { url: 'stun:stunserver.org' },
                        { url: 'stun:stun.softjoys.com' },
                        { url: 'stun:stun.voiparound.com' },
                        { url: 'stun:stun.voipbuster.com' },
                        { url: 'stun:stun.voipstunt.com' },
                        { url: 'stun:stun.voxgratia.org' },
                        { url: 'stun:stun.xten.com' }]
    };
    
    var _localConnection = new RTCPeerConnection(servers);
    var _dataChannel     = _localConnection.createDataChannel('myDataChannel', { reliable: true });
    
    _dataChannel.onopen = function (event) {
        trace('Data channel opened for client ' + destinationID);
        
        onOpen(event);
    };
    
    _dataChannel.onerror = function (e) {
        console.error('Channel error :', e)
    };
    
    _dataChannel.onmessage = function (evt) {
        console.log('Got message : ', evt.data);
    }
    
    function onDataChannel(event) {
        receiveChannel = event.channel;
        receiveChannel.onmessage = function (event) {
            alert(event.data);
        };
    }    ;
    
    trace("Created local peer connection object localPeerConnection");
    _localConnection.ondatachannel = onDataChannel;
    _localConnection.onicecandidate = _handleIceCandidate;
    
    
    function _startOffer() {
        _localConnection.createOffer(_gotLocalDescription);
    }
    
    function _acceptOffer(message) {
        _localConnection.setRemoteDescription(new RTCSessionDescription(message))
    }
    
    function _sendAnswer(message) {
        _acceptOffer(message);
        _localConnection.createAnswer(_gotLocalDescription, null, pc_constraints);
    }
    
    function _setCandidate(message) {
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate
        });
        
        _localConnection.addIceCandidate(candidate);
    }
    
    function _handleIceCandidate(event) {
        if (event.candidate) {
            serverCallback({
                type: 'candidate',
                destinationID : destinationID,
                data: event.candidate
            });
        }
    }
    
    function _gotLocalDescription(desc) {
        _localConnection.setLocalDescription(desc);
        trace("Offer from localPeerConnection: \n" + desc.sdp);
        desc.destinationID = destinationID;
        serverCallback(desc);
    }
    
    function trace(text) {
        console.log((performance.now() / 1000).toFixed(3) + ": " + text);
    }
    
    return {
        localConnection : _localConnection,
        dataChannel     : _dataChannel,
        startOffer      : _startOffer,
        setCandidate    : _setCandidate,
        sendAnswer      : _sendAnswer,
        acceptOffer     : _acceptOffer
    };
}

