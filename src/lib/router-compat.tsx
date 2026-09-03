/**
 * Router-compat shim — bridges react-router-dom v6 call sites to
 * @tanstack/react-router without hand-rewriting every component.
 */
import {
  useNavigate as tsNavigate,
  useLocation as tsLocation,
  useParams as tsParams,
  useRouter,
  Link as TSLink,
  Navigate as TSNavigate,
  Outlet as TSOutlet,
} from "@tanstack/react-router";
import {
  useMemo,
  useCallback,
  forwardRef,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";

// ---------- shared URL parsing ----------

function parseTo(to: string): { pathname: string; search?: Record<string, string>; hash?: string } {
  const [beforeHash, hashStr] = (to ?? "").split("#");
  const [pathname, searchStr] = (beforeHash ?? "").split("?");
  const out: { pathname: string; search?: Record<string, string>; hash?: string } = {
    // react-router keeps the current path for search-only ("?a=1") and
    // hash-only ("#section") targets; TanStack's "." means current route.
    pathname: pathname || ".",
  };
  if (searchStr) out.search = Object.fromEntries(new URLSearchParams(searchStr));
  if (hashStr) out.hash = hashStr;
  return out;
}

/** Build a TanStack navigate/Link option bag without explicit-undefined keys
 * (exactOptionalPropertyTypes forbids passing `hash: undefined` etc.). */
function toOptions(
  to: string,
  extra: { replace?: boolean | undefined; state?: unknown },
): Record<string, unknown> {
  const { pathname, search, hash } = parseTo(to);
  const opts: Record<string, unknown> = { to: pathname };
  if (search) opts["search"] = search;
  if (hash) opts["hash"] = hash;
  if (extra.replace !== undefined) opts["replace"] = extra.replace;
  if (extra.state !== undefined) opts["state"] = extra.state;
  return opts;
}

// ---------- useNavigate ----------

type NavigateOptions = { replace?: boolean; state?: unknown };

type NavigateFn = {
  (to: string | number, options?: NavigateOptions): void;
  (delta: number): void;
};

export function useNavigate(): NavigateFn {
  const tsNav = tsNavigate();
  const router = useRouter();
  return useCallback((to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      router.history.go(to);
      return;
    }
    tsNav(toOptions(to, { replace: options?.replace, state: options?.state }) as never);
  }, [tsNav, router]) as NavigateFn;
}

// ---------- useLocation ----------

export function useLocation() {
  const loc = tsLocation();
  return useMemo(
    () => ({
      pathname: loc.pathname,
      search: loc.searchStr ? `?${loc.searchStr}` : "",
      hash: loc.hash ?? "",
      state: (loc.state ?? null) as unknown,
      key: loc.pathname + (loc.searchStr ?? ""),
    }),
    [loc.pathname, loc.searchStr, loc.hash, loc.state],
  );
}

// ---------- useParams ----------

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  return tsParams({ strict: false } as never) as T;
}


// ---------- useSearchParams (react-router-dom compat) ----------

export function useSearchParams(): [URLSearchParams, (init: URLSearchParams | Record<string, string> | ((prev: URLSearchParams) => URLSearchParams), opts?: { replace?: boolean }) => void] {
  const loc = tsLocation();
  const nav = tsNavigate();
  const router = useRouter();
  const params = useMemo(() => new URLSearchParams(loc.searchStr ?? ""), [loc.searchStr]);
  const setParams = useCallback(
    (
      init: URLSearchParams | Record<string, string> | ((prev: URLSearchParams) => URLSearchParams),
      opts?: { replace?: boolean },
    ) => {
      // Functional updaters read the router's live location, not the render
      // snapshot — react-router passes call-time params, and chained updates
      // within one tick must see each other's writes.
      const live = router.state.location;
      const current = new URLSearchParams(live.searchStr ?? "");
      const next =
        typeof init === "function"
          ? init(current)
          : init instanceof URLSearchParams
            ? init
            : new URLSearchParams(init);
      const searchObj: Record<string, string> = {};
      next.forEach((v, k) => { searchObj[k] = v; });
      const navOpts: Record<string, unknown> = { to: live.pathname, search: searchObj };
      if (opts?.replace !== undefined) navOpts["replace"] = opts.replace;
      nav(navOpts as never);
    },
    [nav, router],
  );
  return [params, setParams];
}

// ---------- Link ----------

export type LinkProps = Omit<ComponentProps<typeof TSLink>, "to" | "search" | "hash" | "state" | "replace" | "className" | "style"> & {
  to: string;
  replace?: boolean;
  state?: unknown;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  children?: ReactNode;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, state, children, ...rest },
  ref,
) {
  const props = {
    ...toOptions(to, { replace, state }),
    ...(rest as Record<string, unknown>),
  };
  return (
    <TSLink ref={ref as never} {...(props as unknown as ComponentProps<typeof TSLink>)}>
      {children}
    </TSLink>
  );
});


// ---------- Navigate ----------

export function Navigate({ to, replace, state }: { to: string; replace?: boolean; state?: unknown }) {
  return <TSNavigate {...(toOptions(to, { replace, state }) as unknown as ComponentProps<typeof TSNavigate>)} />;
}

// ---------- Outlet ----------

export const Outlet = TSOutlet;

// ---------- NavLink ----------

export type NavLinkRenderProps = { isActive: boolean; isPending: boolean };

export type NavLinkProps = Omit<LinkProps, "className" | "style"> & {
  /** Match the path exactly (react-router `end` semantics). */
  end?: boolean;
  className?: string | ((props: NavLinkRenderProps) => string | undefined) | undefined;
  style?: CSSProperties | ((props: NavLinkRenderProps) => CSSProperties | undefined) | undefined;
};

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { to, end, className, style, ...rest },
  ref,
) {
  const loc = tsLocation();
  const target = parseTo(to).pathname;
  const isActive =
    end || target === "/"
      ? loc.pathname === target
      : loc.pathname === target || loc.pathname.startsWith(`${target}/`);
  const renderProps: NavLinkRenderProps = { isActive, isPending: false };
  const resolvedClassName = typeof className === "function" ? className(renderProps) : className;
  const resolvedStyle = typeof style === "function" ? style(renderProps) : style;
  const extra: Record<string, unknown> = {};
  if (resolvedClassName !== undefined) extra["className"] = resolvedClassName;
  if (resolvedStyle !== undefined) extra["style"] = resolvedStyle;
  return <Link ref={ref} to={to} {...(rest as Record<string, unknown>)} {...extra} />;
});
