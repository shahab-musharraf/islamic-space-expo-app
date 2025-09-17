// components/ResendTimer.tsx
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

type Props = {
  onResend: () => void;
};

const ResendTimer = React.memo(({ onResend }: Props) => {
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    setTimer(60); // reset timer
    onResend();   // call resend function
  };

  return timer > 0 ? (
    <Text style={{ color: '#aaa', }}>
      Resend OTP in {timer}s
    </Text>
  ) : (
    <TouchableOpacity onPress={handleResend}>
      <Text style={{ color: '#2ac6ffff' }}>
        Resend OTP
      </Text>
    </TouchableOpacity>
  );
});

export default ResendTimer;
