import React, { Component } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input
} from "reactstrap";

class RoomsListModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomName: ''
    }
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={this.props.toggle}
      >
        <ModalHeader toggle={this.props.toggle}>Create Room</ModalHeader>
        <ModalBody>
          {this.roomsList()}
          <Input value={this.state.roomName} onChange={(e) => this.setState({ roomName: e.target.value })} placeholder="Enter Room Name"></Input>
        </ModalBody>
        <ModalFooter>
          <Button outline color="primary" onClick={this.props.toggle}>
            Close
          </Button>
          <Button outline color="primary" onClick={() => {
            this.props.toggle()
            this.props.createRoom(this.state.roomName)
            //this.setState({ roomName: '' })
          }}>
            Create Room
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  roomsList() {
    return (<ul>
      {this.props.roomsList.map((item, index) => {
        return <li key={`room-${item.id}`}><Button onClick={() => {
          this.props.joinRoom(item.id)
          this.props.toggle()
        }}> {item.name}</Button></li>
      })}
    </ul>)
  }
}

export default RoomsListModal;
