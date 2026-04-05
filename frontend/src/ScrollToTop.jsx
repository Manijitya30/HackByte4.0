import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // useLayoutEffect is also an option for faster execution before paint
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
