# Generates a black video with a countdown timer.
# Requires ffmpeg

fps=10;
seconds=30;
mantissaDigits=1;
fontSize=200;
fontFile="/usr/share/fonts/truetype/msttcorefonts/timesbd.ttf"


ffmpeg -loop 1 -i black480-Ad.png -c:v libx264 \
  -r $fps -t $seconds -pix_fmt yuv420p \
  -vf "fps=$fps,drawtext=fontfile=$fontFile:fontcolor=yellow:fontsize=$fontSize:x=(w-text_w)/2:y=(h-text_h)/2:text='%{eif\:($seconds-t)\:d}.%{eif\:(mod($seconds-t, 1)*pow(10,$mantissaDigits))\:d\:$mantissaDigits}'"\
  fakeAd.mp4;

seconds=120;
ffmpeg -loop 1 -i black480-Content.png -c:v libx264 \
  -r $fps -t $seconds -pix_fmt yuv420p \
  -vf "fps=$fps,drawtext=fontfile=$fontFile:fontcolor=green:fontsize=$fontSize:x=(w-text_w)/2:y=(h-text_h)/2:text='%{eif\:($seconds-t)\:d}.%{eif\:(mod($seconds-t, 1)*pow(10,$mantissaDigits))\:d\:$mantissaDigits}'"\
  fakeContent.mp4;
