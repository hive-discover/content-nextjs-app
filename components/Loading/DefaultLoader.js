import { useEffect, useState } from "react";
import KUTE from "kute.js";

import Divider from "@mui/material/Divider";

export default function DefaultLoader(props) {

  // Start the loading animation after some time to prevent the loading animation from flashing
  const [startAnimation, setStartAnimation] = useState(false);
  useEffect(() => {
    setTimeout(()=>{setStartAnimation(true)}, 750);
  }, [props]);

  useEffect(() => {
    const tween = KUTE.fromTo(
      "#blob1",
      { path: "#blob1" },
      { path: "#blob2" },
      { duration: 2000, repeat: 999, yoyo: true }
    );

    if(startAnimation)
      tween.start();
  }, [startAnimation]);

  return (
    <div
      style={{
        height: "100vh",
        display: startAnimation ? "flex" : "none",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
            <svg
                viewBox="0 0 400 400"
                width={400}
                height={400}
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                id="blob1"
                transform="translate(198.03008491166767 198.3324395885515)"
                d="M97.1 -150.1C122.1 -135 136.1 -101.8 146.8 -69.6C157.5 -37.4 164.8 -6.3 155.6 18.7C146.3 43.8 120.4 62.8 99.7 86C79 109.3 63.6 136.7 39.6 151.3C15.5 166 -17.2 167.9 -49.4 161.5C-81.6 155.1 -113.4 140.4 -132.4 116.1C-151.5 91.7 -157.9 57.7 -155.3 26.9C-152.6 -3.9 -140.9 -31.5 -129.8 -60.8C-118.7 -90.1 -108.3 -121.2 -86.8 -137.8C-65.2 -154.5 -32.6 -156.8 1.7 -159.4C36 -162.1 72.1 -165.2 97.1 -150.1"
                fill="#C62368"
                />

                <path
                id="blob2"
                transform="translate(192.79957216468668 206.24651988375172)"
                d="M30 -57.1C39.9 -46.1 49.8 -40.3 54.2 -31.7C58.5 -23 57.3 -11.5 60.9 2.1C64.5 15.7 72.9 31.3 68.4 39.6C63.8 47.8 46.1 48.6 32.6 47.2C19 45.9 9.5 42.5 -3.4 48.4C-16.3 54.3 -32.7 69.6 -42.2 68.6C-51.7 67.6 -54.4 50.3 -55.1 36.1C-55.8 22 -54.4 11 -54 0.3C-53.5 -10.5 -54 -21 -48.3 -26.4C-42.6 -31.8 -30.7 -32.2 -21.6 -43.6C-12.5 -55 -6.3 -77.5 1.9 -80.7C10 -84 20 -68 30 -57.1"
                fill="#C62368"
                />
            </svg>

        <h4>Loading...</h4>

      
    </div>
  );
}
