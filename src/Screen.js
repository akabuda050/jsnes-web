import React, { Component } from 'react';
import './Screen.css';

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;

class Screen extends Component {
  render() {
    return (
      <canvas
        tabIndex={0}
        className="Screen"
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.props.onMouseUp}
        onKeyDown={(e) => {
          this.props.onKeyDown(e)
        }}
        onKeyUp={(e) => {
          this.props.onKeyUp(e)
        }}
        onKeyPress={(e) => {
          this.props.onKeyPress(e)
        }}
        ref={(canvas) => {
          this.canvas = canvas;
        }}
      />
    );
  }

  componentDidMount() {
    this.initCanvas();
    this.canvas.focus();
  }

  componentDidUpdate() {
    this.initCanvas();
    this.canvas.focus();
  }

  initCanvas() {
    this.context = this.canvas.getContext('2d');
    this.imageData = this.context.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    this.context.fillStyle = 'black';
    // set alpha to opaque
    this.context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // buffer to write on next animation frame
    this.buf = new ArrayBuffer(this.imageData.data.length);
    // Get the canvas buffer in 8bit and 32bit
    this.buf8 = new Uint8ClampedArray(this.buf);
    this.buf32 = new Uint32Array(this.buf);

    // Set alpha
    for (var i = 0; i < this.buf32.length; ++i) {
      this.buf32[i] = 0xff000000;
    }
  }

  setBuffer = (buffer) => {
    var i = 0;
    for (var y = 0; y < SCREEN_HEIGHT; ++y) {
      for (var x = 0; x < SCREEN_WIDTH; ++x) {
        i = y * 256 + x;
        // Convert pixel from NES BGR to canvas ABGR
        this.buf32[i] = 0xff000000 | buffer[i]; // Full alpha
      }
    }
  };

  writeBuffer = () => {
    this.imageData.data.set(this.buf8);
    this.context.putImageData(this.imageData, 0, 0);
    if (this.props.playerId === 1) {
      this.props.websocket.send(JSON.stringify({
        event: 'syncVideoBuffer',
        data: {
          buffer: this.canvasImageData(),
          room: {
            id: this.props.roomId
          }
        }
      }))
    }
  };

  fitInParent = () => {
    let parent = this.canvas.parentNode;
    // @ts-ignore
    let parentWidth = parent.clientWidth;
    // @ts-ignore
    let parentHeight = parent.clientHeight;
    let parentRatio = parentWidth / parentHeight;
    let desiredRatio = SCREEN_WIDTH / SCREEN_HEIGHT;
    if (desiredRatio < parentRatio) {
      this.canvas.style.width = `${Math.round(parentHeight * desiredRatio)}px`;
      this.canvas.style.height = `${parentHeight}px`;
    } else {
      this.canvas.style.width = `${parentWidth}px`;
      this.canvas.style.height = `${Math.round(parentWidth / desiredRatio)}px`;
    }
  };

  canvasImageData = () => {
    return this.canvas.toDataURL('image/png');
  };

  screenshot = () => {
    var img = new Image();
    img.src = this.canvasImageData();
    return img;
  };

  handleMouseDown = (e) => {
    if (!this.props.onMouseDown) return;
    // Make coordinates unscaled
    let scale = SCREEN_WIDTH / parseFloat(this.canvas.style.width);
    let rect = this.canvas.getBoundingClientRect();
    let x = Math.round((e.clientX - rect.left) * scale);
    let y = Math.round((e.clientY - rect.top) * scale);
    this.props.onMouseDown(x, y);
  };
}

export default Screen;
