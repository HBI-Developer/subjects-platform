import { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import parseTime from "@/functions/parseTime";
import {
  Box,
  Icon,
  Presence,
  Slider,
  useDisclosure,
  type SliderValueChangeDetails,
} from "@chakra-ui/react";
import {
  LuCirclePause,
  LuCirclePlay,
  LuVolume,
  LuVolume1,
  LuVolume2,
  LuVolumeOff,
  LuVolumeX,
} from "react-icons/lu";
import { useDispatch } from "react-redux";
import { setResourceLoading } from "@/store/slice/loading";

interface Props {
  src: string;
}

const GRADIENT_COLORS = [
    "#F4443E",
    "#EC4F7A",
    "#9F5AB0",
    "#6B59B7",
    "#4156B5",
    "#1565C0",
    "#1B695D",
    "#F4813D",
    "#E64D3A",
  ],
  GRADIENT_MOVE_SPEED = 2,
  PERCENT = 5000,
  STATE_DURATION = 300,
  AMPLITUDE = 20,
  FREQUENCY = 6,
  WAVES_COLORS = ["#fff"],
  OFFSET_BETWEEN_WAVES = 10,
  WAVES_MOVE_SPEED = 100;

export default function AudioPlayer({ src }: Props) {
  const containerRef = useRef<HTMLDivElement>(null),
    canvasRef = useRef<HTMLCanvasElement>(null),
    stateEffect = useRef<HTMLDivElement>(null),
    dispatch = useDispatch(),
    audio = useRef(new Audio(src)),
    [duration, setDuration] = useState(0),
    [currentTime, setCurrentTime] = useState(0),
    [volume, setVolume] = useState(0),
    volumeMuted = useRef(false),
    { open: openVolumeBar, onToggle } = useDisclosure(),
    currentColors = useRef([
      { color: GRADIENT_COLORS[0], offset: 0 },
      { color: GRADIENT_COLORS[1], offset: 0.5 * PERCENT },
      { color: GRADIENT_COLORS[2], offset: 1 * PERCENT },
    ]),
    gradientColorsPointer = useRef(3),
    isPlaying = useRef(false),
    accumulatedTime = useRef<number>(0),
    lastFrameTime = useRef<number>(performance.now()),
    points = useRef<Array<{ x: number; y: number }>>([]),
    draw = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current,
        context = canvas.getContext("2d"),
        gradient = context?.createLinearGradient(
          0,
          0,
          canvas.width,
          canvas.height
        );

      if (!context || !gradient) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      currentColors.current = currentColors.current
        .map(({ color, offset }, index, arr) => {
          gradient.addColorStop(offset / PERCENT, color);

          if (isPlaying.current) {
            if (offset > 0 && index !== arr.length - 1) {
              return { color, offset: offset - GRADIENT_MOVE_SPEED };
            } else {
              if (index === 0 && arr[1] && arr[1].offset === 0) {
                return undefined;
              }
            }
          }

          return { color, offset };
        })
        .filter((current) => current !== undefined);

      if (currentColors.current.length < 3) {
        currentColors.current.push({
          color: GRADIENT_COLORS[gradientColorsPointer.current],
          offset: PERCENT * 1,
        });

        if (gradientColorsPointer.current < GRADIENT_COLORS.length - 1) {
          gradientColorsPointer.current += 1;
        } else {
          gradientColorsPointer.current = 0;
        }
      }

      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < WAVES_COLORS.length; i++) {
        const color = WAVES_COLORS[i],
          offset = i * OFFSET_BETWEEN_WAVES;

        context.strokeStyle = color;
        context.lineWidth = 3;
        const now = performance.now(),
          dt = (now - lastFrameTime.current) / 1000;

        lastFrameTime.current = now;

        accumulatedTime.current += dt;

        const distanceToMove = WAVES_MOVE_SPEED * dt;
        for (let i = 0; i < points.current.length; i++) {
          points.current[i].x -= distanceToMove;
        }

        const currentAmplitude = isPlaying.current ? AMPLITUDE : 0,
          equilibrium = canvas.height / 2;

        const newY =
          equilibrium +
          currentAmplitude *
            Math.sin(2 * Math.PI * (1 / FREQUENCY) * accumulatedTime.current);

        points.current.push({
          x: canvas.width - offset,
          y: newY,
        });

        points.current = points.current.filter(({ x }) => x > -50);

        context.beginPath();

        context.moveTo(points.current[0].x, points.current[0].y);

        // نوصل بين جميع النقاط
        for (let i = 1; i < points.current.length; i++) {
          context.lineTo(points.current[i].x, points.current[i].y);
        }

        context.stroke();
      }

      setTimeout(() => requestAnimationFrame(draw), 0);
    },
    renderVolume = () => {
      if (volumeMuted.current) {
        return <LuVolumeX />;
      } else {
        switch (true) {
          case volume > 67: {
            return <LuVolume2 />;
          }

          case volume > 34: {
            return <LuVolume1 />;
          }

          default: {
            return <LuVolume />;
          }
        }
      }
    },
    toggleAudio = async () => {
      if (isPlaying.current) {
        await audio.current.pause();
        isPlaying.current = false;
      } else {
        await audio.current.play();
        isPlaying.current = true;
        draw();
      }
    },
    seekingHandler = async ({ value }: SliderValueChangeDetails) => {
      if (duration) {
        const isPlay = isPlaying.current,
          currentTime = audio.current.duration * (value[0] / 100);
        if (isPlay) await toggleAudio();
        audio.current.currentTime = currentTime;
        setCurrentTime(currentTime);

        if (isPlay) toggleAudio();
      }
    },
    changeVolumeHandler = ({ value }: SliderValueChangeDetails) => {
      setVolume(value[0]);
      audio.current.volume = value[0] / 100;
      localStorage.setItem("volume", value[0].toString());
      if (value[0] > 0) volumeMuted.current = false;
      else volumeMuted.current = true;
    },
    toggleMute = () => {
      if (volumeMuted.current) {
        volumeMuted.current = false;
        audio.current.muted = false;
        if (audio.current.volume === 0) {
          changeVolumeHandler({ value: [50] });
        } else {
          changeVolumeHandler({ value: [+localStorage.volume || 50] });
        }
      } else {
        volumeMuted.current = true;
        audio.current.muted = true;
        setVolume(0);
      }
    },
    loadingEnd = () => dispatch(setResourceLoading(false));

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current,
      currentAudio = audio.current,
      setCanvasSize = () => {
        const isMobile = window.innerWidth <= 480;
        if (containerRef.current && canvasRef.current) {
          canvasRef.current.width = container.clientWidth;
          canvasRef.current.height = container.clientHeight;
        }

        (
          document.querySelector(`.${styles.volumeBar}`) as HTMLDivElement
        )?.style.setProperty(
          "height",
          `${container.clientHeight * (isMobile ? 0.6 : 0.7)}px`
        );
      },
      timeupdate = () => setCurrentTime(currentAudio.currentTime);

    setCanvasSize();

    points.current = Array.from(
      { length: canvasRef.current?.width || 100 },
      (_, i) => ({
        x: i,
        y: (canvasRef.current?.height || 100) / 2,
      })
    );

    draw();

    if (localStorage.volume) {
      currentAudio.volume = +localStorage.volume / 100;
    }

    setVolume(currentAudio.volume);

    if (volume > 0) volumeMuted.current = false;
    else volumeMuted.current = true;

    currentAudio.crossOrigin = "anonymous";

    container.addEventListener("resize", setCanvasSize);
    currentAudio.addEventListener("load", loadingEnd);
    currentAudio.addEventListener("canplay", loadingEnd);
    currentAudio.addEventListener("canplaythrough", loadingEnd);
    currentAudio.addEventListener("loadeddata", loadingEnd);
    currentAudio.addEventListener("loadedmetadata", loadingEnd);
    currentAudio.addEventListener("error", loadingEnd);
    currentAudio.addEventListener("timeupdate", timeupdate);

    return () => {
      container.removeEventListener("resize", setCanvasSize);
      currentAudio.removeEventListener("load", loadingEnd);
      currentAudio.removeEventListener("canplay", loadingEnd);
      currentAudio.removeEventListener("canplaythrough", loadingEnd);
      currentAudio.removeEventListener("loadeddata", loadingEnd);
      currentAudio.removeEventListener("loadedmetadata", loadingEnd);
      currentAudio.removeEventListener("error", loadingEnd);
      currentAudio.removeEventListener("timeupdate", timeupdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (duration) {
      stateEffect.current?.style.setProperty("display", "block");
      stateEffect.current?.style.setProperty("animation-name", "unset");
      setTimeout(() => {
        stateEffect.current?.style.setProperty(
          "animation-name",
          "scale-in-out"
        );
      }, 0);
      setTimeout(() => {
        stateEffect.current?.style.setProperty("display", "none");
      }, STATE_DURATION);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying.current]);

  return (
    <Box
      ref={containerRef}
      className={styles.container}
      width={{ base: "100%", sm: "75%", md: "65%", lg: "50%" }}
      aspectRatio={16 / 9}
    >
      <canvas
        ref={canvasRef}
        onClick={async () => {
          await toggleAudio();
          if (!duration) setDuration(audio.current.duration);
        }}
      />

      <Box
        className={`${styles.header} ${duration ? styles.show : ""}`}
        fontSize={{ base: "12px", md: "16px" }}
      >
        <div>{parseTime(currentTime)}</div>
        <div>{parseTime(duration)}</div>
      </Box>

      <div className={`${styles.track} ${duration ? styles.show : ""}`}>
        <Slider.Root
          transform={{ base: "", _hover: "scaleY(1.5)" }}
          transitionProperty={"transform"}
          transitionDuration={".5s"}
          transitionDelay={{ base: "2s", _hover: "0s" }}
          transitionTimingFunction={"ease-in-out"}
          size={"sm"}
          step={0.05}
          value={[duration ? (currentTime / duration) * 100 : 0]}
          onValueChange={seekingHandler}
          cursor={"pointer"}
        >
          <Slider.Control>
            <Slider.Track backgroundColor={"#00000035"}>
              <Slider.Range />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>
        <div className={styles.volume}>
          <Icon
            size={{ base: "lg", md: "xl" }}
            borderRadius={"50%"}
            cursor={"pointer"}
            padding={"5px"}
            onClick={onToggle}
            transition={".2s background-color ease-in-out"}
            backgroundColor={{
              base: "transparent",
              _hover: "#ffffff25",
            }}
          >
            {renderVolume()}
          </Icon>
          <Presence
            present={openVolumeBar}
            animationName={{ _open: "fade-in", _closed: "fade-out" }}
            animationDuration="moderate"
          >
            <div className={styles.volumeBar}>
              <Slider.Root
                size={"sm"}
                step={0.05}
                value={[volume]}
                cursor={"pointer"}
                orientation="vertical"
                onValueChange={changeVolumeHandler}
              >
                <Slider.Control>
                  <Slider.Track backgroundColor={"#00000035"}>
                    <Slider.Range />
                  </Slider.Track>
                </Slider.Control>
              </Slider.Root>
              <Icon
                size={{ base: "lg", md: "xl" }}
                borderRadius={"50%"}
                cursor={"pointer"}
                padding={"5px"}
                transition={".2s background-color ease-in-out"}
                onClick={toggleMute}
                backgroundColor={{
                  base: "transparent",
                  _hover: "#ffffff25",
                }}
              >
                {volumeMuted.current ? <LuVolume2 /> : <LuVolumeOff />}
              </Icon>
            </div>
          </Presence>
        </div>
      </div>
      <Box
        ref={stateEffect}
        animationDuration={`${STATE_DURATION}ms`}
        animationTimingFunction={"linear"}
        className={styles.stateEffect}
      >
        <Icon boxSize={{ base: 75, md: 100 }}>
          {isPlaying.current ? <LuCirclePlay /> : <LuCirclePause />}
        </Icon>
      </Box>
    </Box>
  );
}
