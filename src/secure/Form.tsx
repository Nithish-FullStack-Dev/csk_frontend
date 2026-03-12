"use client";

import { useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Form = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  // ✅ send otp mutation
  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}/api/auth/send-otp`,
        {
          email,
        },
        { withCredentials: true },
      );
      return res.data;
    },

    onSuccess: (data) => {
      setOtpSent(true);
      toast.success(data.message || "OTP sent successfully!");
    },
    onError: (err) => {
      console.log("error", err);
      toast.error(
        axios.isAxiosError(err) ? err.response.data.message : err.message,
      );
    },
  });

  // ✅ verify otp mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}/api/auth/verify-otp-access`,
        {
          email,
          otp,
        },
        { withCredentials: true },
      );
      return res.data;
    },

    onSuccess: (data) => {
      toast.success(data.message || "OTP verified successfully!");
      navigate("/secure/dashboard");
    },
    onError: (err) => {
      console.log("error", err);
      toast.error(
        axios.isAxiosError(err) ? err.response.data.message : err.message,
      );
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>

            <Input
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Send OTP */}
          {!otpSent && (
            <Button
              className="w-full"
              disabled={!email || sendOtpMutation.isPending}
              onClick={() => sendOtpMutation.mutate()}
            >
              {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
            </Button>
          )}

          {/* OTP */}
          {otpSent && (
            <>
              <div className="space-y-2">
                <Label>OTP</Label>

                <Input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                disabled={!otp || verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Form;
