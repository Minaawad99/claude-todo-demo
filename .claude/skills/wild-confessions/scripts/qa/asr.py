import sherpa_onnx, sys, glob, subprocess, numpy as np
m=sys.argv[1]
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{m}/small-encoder.int8.onnx",decoder=f"{m}/small-decoder.int8.onnx",tokens=f"{m}/small-tokens.txt",language="ar",task="transcribe",num_threads=4)
for f in sorted(glob.glob(sys.argv[2]+"/*.wav")):
    raw=subprocess.run(["ffmpeg","-v","error","-i",f,"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
    a=np.frombuffer(raw,np.float32); s=rec.create_stream(); s.accept_waveform(16000,a); rec.decode_stream(s)
    print(f.split('/')[-1], f"{len(a)/16000:.1f}s", s.result.text)
