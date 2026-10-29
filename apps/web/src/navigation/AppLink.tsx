import { Link, type LinkProps } from "react-router";
import { prefetchPage } from "./pages";
import { useNavigationSession } from "./Session";

export default function AppLink({
  to,
  onClick,
  onMouseEnter,
  onFocus,
  onPointerDown,
  ...props
}: Omit<LinkProps, "to"> & { to: string }) {
  const { captureScroll } = useNavigationSession();
  return (
    <Link
      {...props}
      to={to}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        if (!event.defaultPrevented) prefetchPage(to);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (!event.defaultPrevented) prefetchPage(to);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!event.defaultPrevented) prefetchPage(to);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) captureScroll();
      }}
    />
  );
}
