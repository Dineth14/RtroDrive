"""Read-only synthetic ECU. Optional adapter is restricted to Linux vcan interfaces."""
import argparse
import json
import socket
import struct


class ObdEcu:
    SUPPORTED = {0x04, 0x05, 0x0B, 0x0C, 0x0D, 0x0F, 0x10, 0x11, 0x20, 0x2F, 0x40, 0x42}

    def __init__(self, rpm=2000, coolant=87, voltage=14.2):
        self.rpm, self.coolant, self.voltage = rpm, coolant, voltage

    def request(self, payload):
        p = bytes(payload)
        if not p:
            return None
        if p[0] not in (1, 3, 9):
            return bytes((0x7F, p[0], 0x11))
        if p == b'\x03':
            return bytes((0x43, 1, 0x01, 0x71))  # Synthetic P0171, not inferred vehicle data.
        if p == b'\x09\x02':
            return b'\x49\x02\x01WVWZZZ1JZXW000001'  # Explicit fixture VIN.
        if len(p) != 2 or p[0] != 1:
            return bytes((0x7F, p[0], 0x12))
        pid = p[1]
        if pid in (0, 0x20, 0x40):
            bitmap = sum(1 << (32 - (item - pid)) for item in self.SUPPORTED if pid < item <= pid + 32)
            return bytes((0x41, pid)) + bitmap.to_bytes(4, 'big')
        data = {
            0x04: bytes((89,)), 0x05: bytes((max(0, min(255, round(self.coolant + 40))),)),
            0x0B: bytes((52,)), 0x0C: max(0, min(65535, round(self.rpm * 4))).to_bytes(2, 'big'),
            0x0D: bytes((60,)), 0x0F: bytes((72,)), 0x10: bytes((0, 250)),
            0x11: bytes((51,)), 0x2F: bytes((153,)),
            0x42: max(0, min(65535, round(self.voltage * 1000))).to_bytes(2, 'big'),
        }
        return bytes((0x41, pid)) + data[pid] if pid in data else bytes((0x7F, 1, 0x12))


def segment(payload):
    if not 0 < len(payload) <= 4095:
        raise ValueError('Classical ISO-TP payload length out of bounds')
    if len(payload) <= 7:
        return [bytes((len(payload),)) + payload]
    frames = [bytes((0x10 | (len(payload) >> 8), len(payload) & 255)) + payload[:6]]
    for index, offset in enumerate(range(6, len(payload), 7), 1):
        frames.append(bytes((0x20 | (index & 15),)) + payload[offset:offset + 7])
    return frames


def serve_vcan(interface, extended):
    # Deliberately do not accept can0 or any physical adapter as a simulator target.
    if not interface.startswith('vcan') or not interface[4:].isdigit():
        raise ValueError('Only explicitly named vcanN interfaces are allowed')
    ecu = ObdEcu()
    request_id = 0x18DB33F1 if extended else 0x7DF
    response_id = 0x18DAF110 if extended else 0x7E8
    flag = 0x80000000 if extended else 0
    with socket.socket(socket.PF_CAN, socket.SOCK_RAW, socket.CAN_RAW) as bus:
        bus.bind((interface,))
        while True:
            can_id, length, data = struct.unpack('=IB3x8s', bus.recv(16))
            if can_id != request_id | flag or length < 2 or data[0] >> 4 != 0:
                continue
            count = data[0] & 15
            if count == 0 or count > min(7, length - 1):
                continue
            response = ecu.request(data[1:count + 1])
            if response is None:
                continue
            frames = segment(response)
            # This minimal adapter only publishes single-frame responses. Multi-frame
            # VIN fixtures are exercised offline until flow-control scheduling is added.
            if len(frames) != 1:
                continue
            frame = frames[0]
            bus.send(struct.pack('=IB3x8s', response_id | flag, 8, frame.ljust(8, b'\0')))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--request', default='0100', help='Hex diagnostic PDU for offline response')
    parser.add_argument('--vcan', help='Explicit Linux vcanN interface; single-frame adapter only')
    parser.add_argument('--extended', action='store_true')
    args = parser.parse_args()
    if args.vcan:
        serve_vcan(args.vcan, args.extended)
    else:
        reply = ObdEcu().request(bytes.fromhex(args.request))
        print(json.dumps({'simulated': True, 'pdu': reply.hex() if reply else None,
                          'frames': [f.hex() for f in segment(reply)] if reply else []}))


if __name__ == '__main__':
    main()
