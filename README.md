# webaudio_gain_n_delay-with-webrtc

```
getUserMedia -> (stream)
                   ↓
             MediaStreamSourceNode -> GainNode -> DelayNode -> MediaStreamDestination
                                                                       ↓
                                                                    (stream)
                                                                       ↓
                     HTMLAudioElement <- RTCPeerConnection <-> RTCPeerConnection
```
