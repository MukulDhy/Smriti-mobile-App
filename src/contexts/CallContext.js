import React, { createContext, useContext, useState, useRef } from 'react';
import { useWebSocket } from './WebSocketContext';

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const { sendMessage } = useWebSocket();
  const [currentCall, setCurrentCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const peerConnection = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const initPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({
          type: 'webrtc-ice-candidate',
          callId: currentCall?.callId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.current = pc;
    return pc;
  };

  const startCall = async (receiverId, callType = 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true,
      });
      
      setLocalStream(stream);
      const pc = initPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendMessage({
        type: 'initiate-call',
        receiverId,
        callType,
        offer,
      });

      setCurrentCall({
        callId: `temp_${Date.now()}`,
        callerId: 'current-user', // You'll replace this with actual user ID
        receiverId,
        callType,
        status: 'ringing',
      });
      setCallStatus('ringing');

    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const handleIncomingCall = (callData) => {
    setIncomingCall(callData);
    setCallStatus('incoming');
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.callType === 'video',
        audio: true,
      });
      
      setLocalStream(stream);
      const pc = initPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(incomingCall.offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendMessage({
        type: 'accept-call',
        callId: incomingCall.callId,
        answer,
      });

      setCurrentCall(incomingCall);
      setIncomingCall(null);
      setCallStatus('active');

    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  const rejectCall = () => {
    if (!incomingCall) return;

    sendMessage({
      type: 'reject-call',
      callId: incomingCall.callId,
    });

    setIncomingCall(null);
    setCallStatus('idle');
  };

  const endCall = () => {
    if (!currentCall) return;

    sendMessage({
      type: 'end-call',
      callId: currentCall.callId,
    });

    // Clean up
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setCurrentCall(null);
    setCallStatus('idle');
  };

  const handleRemoteAnswer = async (answer) => {
    if (!peerConnection.current) return;
    await peerConnection.current.setRemoteDescription(answer);
  };

  const handleRemoteOffer = async (offer) => {
    const pc = initPeerConnection();
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    sendMessage({
      type: 'webrtc-answer',
      callId: currentCall.callId,
      answer,
    });
  };

  const handleIceCandidate = (candidate) => {
    if (!peerConnection.current) return;
    peerConnection.current.addIceCandidate(candidate);
  };

  return (
    <CallContext.Provider
      value={{
        currentCall,
        callStatus,
        incomingCall,
        localStream,
        remoteStream,
        localVideoRef,
        remoteVideoRef,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        handleIncomingCall,
        handleRemoteAnswer,
        handleRemoteOffer,
        handleIceCandidate,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);