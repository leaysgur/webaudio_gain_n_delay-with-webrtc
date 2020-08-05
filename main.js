(async () => {
  const [$gum, $connect] = document.querySelectorAll("button");
  const [$gain, $delay] = document.querySelectorAll("input");
  const [$audio] = document.querySelectorAll("audio");

  const state = {
    track: null,
    gain: null,
    delay: null,
  };

  $gum.onclick = async () => {
    // Original stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: 1 });
    const [track] = stream.getAudioTracks();

    // Create audio pipeline w/ WebAudio
    const ctx = new AudioContext();
    const msNode = ctx.createMediaStreamSource(new MediaStream([track]));

    const gainNode = ctx.createGain();
    state.gain = gainNode.gain;
    state.gain.value = Number($gain.value);

    const delayNode = ctx.createDelay();
    state.delay = delayNode.delayTime;
    state.delay.value = $delay.checked ? 1 : 0;

    // Piped stream
    const dest = ctx.createMediaStreamDestination();

    msNode.connect(gainNode);
    gainNode.connect(delayNode);
    delayNode.connect(dest);
    // msNode.connect(ctx.destination);

    // Send this track w/ WebRTC
    state.track = dest.stream.getAudioTracks()[0];

    $gum.disabled = true;
    console.log("get audio stream", state);
  };

  $connect.onclick = async () => {
    if (state.track === null) return;

    const pc1 = new RTCPeerConnection();
    const pc2 = new RTCPeerConnection();

    pc2.ontrack = ev => {
      $audio.srcObject = new MediaStream([ev.track]);
      $audio.play();
      console.log("ontrack", ev.track);
    };

    pc1.addTransceiver(state.track, {
      streams: [ new MediaStream() ],
      direction: 'sendonly'
    });

    await Promise.all([
      pc1.createOffer(),
      pc1.setLocalDescription(),
    ]);

    await Promise.all([
      pc2.setRemoteDescription(pc1.localDescription),
      pc2.createAnswer(),
      pc2.setLocalDescription(),
    ]);

    console.log(pc1.localDescription);
    console.log(pc2.localDescription);

    await pc1.setRemoteDescription(pc2.localDescription);

    $connect.disabled = true;
    console.log("connected");
  };

  $gain.onchange = () => {
    if (state.gain === null) return;

    state.gain.value = Number($gain.value);
    console.log("gain", state.gain.value);
  };

  $delay.onchange = () => {
    if (state.delay === null) return;

    state.delay.value = $delay.checked ? 1 : 0;
    console.log("delay", state.delay.value);
  };
})();
