"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, LogIn, User } from "lucide-react";
import { Field, SubmitButton, invalid, useAdminForm } from "@/components/admin/form";
import { loginAction } from "./actions";

export default function LoginForm({ next }: { next: string }) {
  const { pending, onSubmit, err } = useAdminForm(loginAction);
  const [show, setShow] = useState(false);

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />

      <Field label="شماره موبایل یا ایمیل" name="identifier" error={err("identifier")?.trim()}>
        <div className="relative">
          <User className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="identifier"
            name="identifier"
            autoComplete="username"
            autoFocus
            dir="ltr"
            placeholder="09120000000"
            className="adm-input py-3 ps-10 text-left placeholder:text-left"
            {...invalid(err("identifier"), "identifier")}
          />
        </div>
      </Field>

      <Field label="گذرواژه" name="password" error={err("password")?.trim()}>
        <div className="relative">
          <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            dir="ltr"
            className="adm-input py-3 pe-11 ps-10 text-left"
            {...invalid(err("password"), "password")}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute end-2 top-1/2 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muted hover:text-cream"
            aria-label={show ? "پنهان کردن گذرواژه" : "نمایش گذرواژه"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-cream/80">
        <input type="checkbox" name="remember" className="h-4 w-4 cursor-pointer rounded accent-gold-500" />
        مرا به خاطر بسپار
      </label>

      <div className="pt-1 [&>button]:w-full [&>button]:py-3">
        <SubmitButton pending={pending}>
          {!pending && <LogIn className="h-4 w-4" />}
          ورود به پنل
        </SubmitButton>
      </div>
    </form>
  );
}
