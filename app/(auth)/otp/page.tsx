"use client";
import Submit from "@/app/ui/submit";
import { formatEmail } from "@/libs/functions";
import { useBoundStore } from "@/store/store";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";

export default function OTP() {
  const { user, storeUserToken} = useBoundStore();
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [counter, setCounter] = useState<number>(300); 
  const [isResendDisabled, setIsResendDisabled] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [errorMessage,setErrorMessage] = useState("")
  const [oState, setOState] = useState<
    "loading" | "idle" | "submitted" | "error"
  >("idle");

  const router = useRouter();

  useEffect(()=>{
    console.log(user)
  },[user])


  // Timer effect for countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (counter > 0 && isResendDisabled) {
      interval = setInterval(() => {
        setCounter((prevCounter) => prevCounter - 1);
      }, 1000);
    } else if (counter === 0) {
      setIsResendDisabled(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [counter, isResendDisabled]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Handle input change
  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;

    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current input is empty, move to previous input
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain");

    // Only process if it's 6 digits
    if (/^\d{6}$/.test(pasteData)) {
      const newOtp = pasteData.split("");
      setOtp(newOtp);

      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      alert("Please enter all 6 digits");
      return;
    }

    console.log(user?.email, user?.userType);

    setOState("loading");

    try {
      if (user?.email && user.userType === "unverified") {
        const newData = {
          email: user.email,
          code: otpValue,
        };

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/verify-email`,
          {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(newData),
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!res.ok){
           throw new Error("OTP verification failed");
        }

        console.log("OTP submitted:", otpValue);

        const response = await res.json()
        // console.log(response)
        storeUserToken(response.token)
        setOState("submitted");

        setTimeout(()=>{
           router.push('/sign-in');
        },3000)
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      setErrorMessage("OTP verification failed.")
      setOState("error");
    }
  };

  // Handle resend code
  const handleResend = async () => {
    if (isResendDisabled) return;

    try {
      // Simulate resend API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCounter(300);
      setIsResendDisabled(true);
      setOtp(new Array(6).fill(""));

      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      alert("Failed to resend OTP. Please try again.");
    }
  };

  // Check if OTP is complete
  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="flex flex-col items-center pt-16 md:pt-24">
      <h1 className="text-3xl md:text-4xl font-avenir font-bold">
        Email Verification
      </h1>
      <p className="font-avenir text-md md:text-lg font-medium my-4 text-center">
        Verify your email with the 6-digit code <br /> sent to
        <span>
          {user?.userType === "unverified" && (
            <span className="font-semibold px-2">{formatEmail(user.email)}</span>
          )}
        </span>
      </p>

      <form
        className="mt-6 px-[2px] w-[85%] flex-col flex items-center justify-center md:w-auto"
        onSubmit={handleSubmit}
      >
        <div className="flex gap-4 md:gap-6  px-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`
                w-10 h-14 border-1 text-center text-lg font-semibold
                focus:outline-none rounded transition-all duration-200
                ${
                  digit
                    ? "border-green-500 bg-green-50"
                    : "border-black focus:border-blue-500"
                }
                ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
              `}
              disabled={isSubmitting}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        <Submit type={oState} submitType="otp" errorMessage={errorMessage} />

        <div className="flex justify-between mt-4 w-full px-[3px]">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResendDisabled}
            className={`
              font-medium font-avenir transition-colors duration-200
              ${
                isResendDisabled
                  ? "text-black/30 cursor-not-allowed"
                  : "text-blue-600 hover:text-blue-800 cursor-pointer underline"
              }
            `}
          >
            {isResendDisabled ? "Resend code in" : "Resend New Code"}
          </button>

          {isResendDisabled && (
            <p className="text-black/60 font-medium font-avenir">
              {formatTime(counter)}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
