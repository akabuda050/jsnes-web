import React, { Component } from "react";
import { Button, Progress } from "reactstrap";
import { Link } from "react-router-dom";

import config from "./config";
import ControlsModal from "./ControlsModal";
import RoomsListModal from "./RoomsListModal";
import Emulator from "./Emulator";
import SlaveScreen from "./SlaveScreen";
import RomLibrary from "./RomLibrary";
import { loadBinary } from "./utils";

import "./RunPage.css";

/*
 * The UI for the emulator. Also responsible for loading ROM from URL or file.
 */
class RunPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      romName: null,
      romData: null,
      emulatorKey: null,
      slaveScreenKey: null,
      running: false,
      paused: false,
      controlsModalOpen: false,
      createRoomModalOpen: false,
      loading: true,
      loadedPercent: 3,
      error: null,
      roomsList: [],
      roomId: null,
    };
  }

  render() {
    return (
      <div className="RunPage">
        <nav
          className="navbar navbar-expand"
          ref={(el) => {
            this.navbar = el;
          }}
        >
          <ul className="navbar-nav" style={{ width: "200px" }}>
            <li className="navitem">
              <Link to="/" className="nav-link">
                &lsaquo; Back
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav ml-auto mr-auto">
            <li className="navitem">
              <span className="navbar-text mr-3">{this.state.romName}</span>
            </li>
          </ul>
          <ul className="navbar-nav" style={{ width: "200px" }}>
            <li className="navitem">
              <Button
                outline
                color="primary"
                onClick={this.toggleCreateRoomModal}
                className="mr-3"
              >
                Rooms
              </Button>
              <Button
                outline
                color="primary"
                onClick={this.toggleControlsModal}
                className="mr-3"
              >
                Controls
              </Button>
              <Button
                outline
                color="primary"
                onClick={this.handlePauseResume}
                disabled={!this.state.running}
              >
                {this.state.paused ? "Resume" : "Pause"}
              </Button>
            </li>
          </ul>
        </nav>

        {this.state.error ? (
          this.state.error
        ) : (
          <div
            className="screen-container"
            ref={(el) => {
              this.screenContainer = el;
            }}
          >
            {this.state.loading ? (
              <Progress
                value={this.state.loadedPercent}
                style={{
                  position: "absolute",
                  width: "70%",
                  left: "15%",
                  top: "48%",
                }}
              />
            ) : this.state.romData && this.state.playerId === 1 ? (
              <Emulator
                romData={this.state.romData}
                romName={this.state.romName}
                paused={this.state.paused}
                ref={(emulator) => {
                  this.emulator = emulator;
                }}
                websocket={this.state.websocket}
                key={this.state.emulatorKey}
                playerId={this.state.playerId}
                roomId={this.state.roomId}
              />
            ) : this.state.playerId === 2 ? (
              <SlaveScreen
                romName={this.state.romName}
                ref={(slaveScreen) => {
                  this.slaveScreen = slaveScreen;
                }}
                onKeyDown={(e) => {
                  this.state.websocket.send(
                    JSON.stringify({
                      event: "keyPressed",
                      data: {
                        direction: "down",
                        key: e.key,
                        room: {
                          id: this.state.roomId,
                        },
                      },
                    })
                  );
                }}
                onKeyUp={(e) => {
                  this.state.websocket.send(
                    JSON.stringify({
                      event: "keyPressed",
                      data: {
                        direction: "up",
                        key: e.key,
                        room: {
                          id: this.state.roomId,
                        },
                      },
                    })
                  );
                }}
                onKeyPress={(e) => {
                  console.log(e);
                }}
                key={this.state.slaveScreenKey}
              />
            ) : null}

            {this.state.createRoomModalOpen && (
              <RoomsListModal
                isOpen={this.state.createRoomModalOpen}
                toggle={this.toggleCreateRoomModal}
                createRoom={this.createRoom.bind(this)}
                joinRoom={this.joinRoom.bind(this)}
                roomsList={this.state.roomsList}
              />
            )}

            {/* TODO: lift keyboard and gamepad state up */}
            {this.state.controlsModalOpen && (
              <ControlsModal
                isOpen={this.state.controlsModalOpen}
                toggle={this.toggleControlsModal}
                keys={this.emulator.keyboardController.keys}
                setKeys={this.emulator.keyboardController.setKeys}
                promptButton={this.emulator.gamepadController.promptButton}
                gamepadConfig={this.emulator.gamepadController.gamepadConfig}
                setGamepadConfig={
                  this.emulator.gamepadController.setGamepadConfig
                }
              />
            )}
          </div>
        )}
      </div>
    );
  }

  createRoom(name) {
    console.log(name);
    this.state.websocket.send(
      JSON.stringify({
        event: "createRoom",
        data: {
          name,
        },
      })
    );
  }

  joinRoom(id) {
    console.log(id);
    this.state.websocket.send(
      JSON.stringify({
        event: "joinRoom",
        data: {
          id,
        },
      })
    );
  }

  onRoomsList(data) {
    this.setState({
      roomsList: data.rooms,
    });
  }

  onJoinedToRoom(data) {
    this.setState({
      roomId: data.room.id,
      playerId: data.playerId,
      slaveScreenKey: `slaveScreenKeyS_${Date.now()}`,
      playerId: data.playerId,
      loading: false,
    });
  }

  onConnected(data){
    this.setState({
      roomsList: data.rooms,
    });
  }

  onRomLoaded(data) {
    console.log(data.playerId);
    this.setState((prev) => {
      return {
        romData: data.romData,
        romName: data.romName,
        emulatorKey: data.romName,
        slaveScreenKey: `slaveScreenKeyS_${Date.now()}`,
        playerId: data.playerId,
        roomId: data.roomId,
        loading: false,
      };
    });
  }

  onPlayerTwoPressKey({ direction, key }) {
    console.log(key);
    const keys = {
      x: 0,
      z: 1,
      Control: 2,
      Enter: 3,
      ArrowUp: 4,
      ArrowDown: 5,
      ArrowLeft: 6,
      ArrowRight: 7,
    };
    switch (direction) {
      case "down":
        this.emulator.nes.buttonDown(2, keys[key]);
        break;
      case "up":
        this.emulator.nes.buttonUp(2, keys[key]);
        break;
    }
  }

  onSyncVideoBuffer(data) {
    if (
      this.state.playerId === 2 &&
      this.state.websocket.readyState === WebSocket.OPEN &&
      this.slaveScreen
    ) {
      // console.log(data.buffer.length)
      // var buffer = new ArrayBuffer(data.buffer);
      this.slaveScreen.syncBuffer(data.buffer);
    }
  }

  onSyncAudioBuffer(data) {
    if (
      this.state.playerId === 2 &&
      this.state.websocket.readyState === WebSocket.OPEN &&
      this.slaveScreen
    ) {
      //console.log(data.buffer)
      // var buffer = new ArrayBuffer(data.buffer);
      this.slaveScreen.speakers.syncAudioBuffer(data.buffer);
    }
  }

  componentDidMount() {
    window.addEventListener("resize", this.layout);
    this.layout();
    const websocket = new WebSocket(config.SERVER_URL);

    websocket.binaryType = "arraybuffer";
    websocket.onmessage = (message) => {
      if (typeof message.data === "string") {
        const { event, data } = JSON.parse(message.data);
        const eventListener = `on${event.charAt(0).toUpperCase() +
          event.slice(1)}`;

        if (typeof this[eventListener] === "function") {
          this[eventListener](data);
        }
      }
    };
    this.setState({ websocket: websocket });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.layout);
    if (this.currentRequest) {
      this.currentRequest.abort();
    }
    if (this.state.websocket) {
      this.state.websocket.onclose = function() {}; // disable onclose handler first
      this.state.websocket.close();
    }
  }

  load = () => {
    if (this.props.match.params.slug) {
      const slug = this.props.match.params.slug;
      const isLocalROM = /^local-/.test(slug);
      const romHash = slug.split("-")[1];
      const romInfo = isLocalROM
        ? RomLibrary.getRomInfoByHash(romHash)
        : config.ROMS[slug];

      if (!romInfo) {
        this.setState({ error: `No such ROM: ${slug}` });
        return;
      }

      if (isLocalROM) {
        this.setState({ romName: romInfo.name });
        const localROMData = localStorage.getItem("blob-" + romHash);
        this.handleLoaded(localROMData);
      } else {
        this.setState({ romName: romInfo.description });
        this.currentRequest = loadBinary(
          romInfo.url,
          (err, data) => {
            if (err) {
              this.setState({ error: `Error loading ROM: ${err.message}` });
            } else {
              this.handleLoaded(data);
            }
          },
          this.handleProgress
        );
      }
    } else if (this.props.location.state && this.props.location.state.file) {
      let reader = new FileReader();
      reader.readAsBinaryString(this.props.location.state.file);
      reader.onload = (e) => {
        this.currentRequest = null;
        this.handleLoaded(reader.result);
      };
    } else {
      this.setState({ error: "No ROM provided" });
    }
  };

  handleProgress = (e) => {
    if (e.lengthComputable) {
      this.setState({ loadedPercent: (e.loaded / e.total) * 100 });
    }
  };

  handleLoaded = (data) => {
    this.setState({ running: true, loading: false, romData: data });
  };

  handlePauseResume = () => {
    this.setState({ paused: !this.state.paused });
  };

  layout = () => {
    let navbarHeight = parseFloat(window.getComputedStyle(this.navbar).height);
    this.screenContainer.style.height = `${window.innerHeight -
      navbarHeight}px`;
    if (this.emulator) {
      this.emulator.fitInParent();
    }
    if (this.slaveScreen) {
      this.slaveScreen.fitInParent();
    }
  };

  toggleControlsModal = () => {
    this.setState({ controlsModalOpen: !this.state.controlsModalOpen });
  };
  toggleCreateRoomModal = () => {
    this.setState({ createRoomModalOpen: !this.state.createRoomModalOpen });
  };
}

export default RunPage;
