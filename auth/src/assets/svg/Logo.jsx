import * as React from "react";

function SvgComponent(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={27} height={40} viewBox="0 0 27 40" {...props}>
      <image href="../svg/logo.png" x="0" y="0" width="27" height="40" />
    </svg>
  );
}

export default SvgComponent;
