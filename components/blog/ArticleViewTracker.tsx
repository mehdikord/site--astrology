"use client";

import { useEffect } from "react";

/** شمارش بازدید مقاله — صفحه‌ی مقاله استاتیک است، پس بازدید از سمت مرورگر ثبت می‌شود */
export default function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* حالت خصوصی مرورگر */
    }
    fetch(`/api/articles/${encodeURIComponent(slug)}/view/`, { method: "POST", keepalive: true }).catch(() => {});
  }, [slug]);
  return null;
}
