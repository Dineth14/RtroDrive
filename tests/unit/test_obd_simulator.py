import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('obd_simulator', Path(__file__).parents[2] / 'tools/vehicle-simulator/obd_simulator.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ObdTests(unittest.TestCase):
    def test_conversion_fixture(self):
        self.assertEqual(module.ObdEcu().request(b'\x01\x0c'), bytes.fromhex('410c1f40'))

    def test_bitmap_continuation(self):
        ecu = module.ObdEcu()
        self.assertEqual(ecu.request(b'\x01\x00')[-1] & 1, 1)
        self.assertEqual(ecu.request(b'\x01\x20')[-1] & 1, 1)
        self.assertEqual(ecu.request(b'\x01\x40')[-1] & 1, 0)

    def test_unsupported_and_writes(self):
        self.assertEqual(module.ObdEcu().request(b'\x01\xaa'), b'\x7f\x01\x12')
        self.assertEqual(module.ObdEcu().request(b'\x04'), b'\x7f\x04\x11')

    def test_vin_segmentation(self):
        pdu = module.ObdEcu().request(b'\x09\x02')
        frames = module.segment(pdu)
        self.assertEqual(len(pdu), 20)
        self.assertEqual([frame[0] for frame in frames], [0x10, 0x21, 0x22])
        self.assertEqual(frames[0][2:] + frames[1][1:] + frames[2][1:], pdu)

    def test_reject_physical_bus(self):
        with self.assertRaises(ValueError):
            module.serve_vcan('can0', False)

    def test_bad_payload_bounds(self):
        for value in (b'', b'x' * 4096):
            with self.assertRaises(ValueError):
                module.segment(value)


if __name__ == '__main__':
    unittest.main()
