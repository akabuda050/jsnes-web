import React, { Component } from 'react';
import './Screen.css';
import SlaveSpeakers from './SlaveSpeakers';

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;

class SlaveScreen extends Component {
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
    this.fitInParent();

    this.speakers = new SlaveSpeakers();

    this.speakers.start()
  }

  componentDidUpdate() {
    this.initCanvas();
  }

  initCanvas() {
    this.context = this.canvas.getContext('2d');
    this.imageData = this.context.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    this.context.fillStyle = 'black';
    // set alpha to opaque
    this.context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  syncBuffer(buffer) {
    var image = new Image();
    image.onload = () => {
      this.context.drawImage(image, 0, 0);
    }
    image.src = buffer
  }

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

export default SlaveScreen;
