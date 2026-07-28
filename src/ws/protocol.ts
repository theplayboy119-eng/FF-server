import path from 'path';
import protobuf from 'protobufjs';

const root = protobuf.loadSync(path.join(__dirname, '../proto/messages.proto'));
const Envelope = root.lookupType('ff.Envelope');
const JoinRequest = root.lookupType('ff.JoinRequest');
const JoinResponse = root.lookupType('ff.JoinResponse');
const Input = root.lookupType('ff.Input');
const Snapshot = root.lookupType('ff.Snapshot');

export function decodeMessage(data: any) {
  // binary protobuf
  try {
    if (data instanceof Buffer || data instanceof Uint8Array) {
      const env = Envelope.decode(data);
      const obj = Envelope.toObject(env, { longs: String, enums: String, bytes: Buffer });
      const type = obj.type as string;
      const payloadBuf = obj.payload as Buffer;
      let payload: any = null;
      if (type === 'join') payload = JoinRequest.decode(payloadBuf);
      else if (type === 'joined') payload = JoinResponse.decode(payloadBuf);
      else if (type === 'input') payload = Input.decode(payloadBuf);
      else if (type === 'snapshot') payload = Snapshot.decode(payloadBuf);
      else {
        // unknown type: try JSON buffer
        try { payload = JSON.parse(payloadBuf.toString()); } catch (e) { payload = null; }
      }
      return { type, payload: payload ? (payload as any) : null, isBinary: true };
    }
  } catch (err) {
    // fallthrough to JSON
    // console.warn('protobuf decode failed', err);
  }

  // try JSON text
  try {
    const str = data.toString();
    const msg = JSON.parse(str);
    return { type: msg.type, payload: msg, isBinary: false };
  } catch (err) {
    return null;
  }
}

function encodeEnvelope(type: string, payloadBuf: Buffer) {
  const envMsg = Envelope.create({ type, payload: payloadBuf });
  return Envelope.encode(envMsg).finish();
}

export function encodeJoinResponse(obj: any, asBinary = true) {
  if (!asBinary) return JSON.stringify({ type: 'joined', ...obj });
  const buf = JoinResponse.encode(JoinResponse.create(obj)).finish();
  return encodeEnvelope('joined', Buffer.from(buf));
}

export function encodeSnapshot(obj: any, asBinary = true) {
  if (!asBinary) return JSON.stringify({ type: 'snapshot', ...obj });
  const buf = Snapshot.encode(Snapshot.create(obj)).finish();
  return encodeEnvelope('snapshot', Buffer.from(buf));
}

export function encodeQueued(obj: any, asBinary = true) {
  if (!asBinary) return JSON.stringify({ type: 'queued', ...obj });
  const b = Buffer.from(JSON.stringify(obj));
  return encodeEnvelope('queued', b);
}
