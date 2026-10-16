import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

interface SwitchRootProps {
  children: ReactNode;
}

interface SwitchCaseProps {
  // NOSONAR(typescript:S6767) -- compound-component marker: read by SwitchRoot via child.props, not here.
  condition: boolean;
  children: ReactNode;
}

interface SwitchDefaultProps {
  children: ReactNode;
}

interface SwitchLayoutProps {
  children: ReactElement;
  // NOSONAR(typescript:S6767) -- compound-component marker: read by SwitchRoot via child.props, not here.
  withDefault?: boolean;
}

const SwitchCase = ({ children }: SwitchCaseProps) => {
  return <>{children}</>;
};

const SwitchDefault = ({ children }: SwitchDefaultProps) => {
  return <>{children}</>;
};

const SwitchLayout = ({ children }: SwitchLayoutProps) => {
  return <>{children}</>;
};

const SwitchRoot = ({ children }: SwitchRootProps) => {
  let defaultCase: ReactElement | null = null;
  let matchedCase: ReactElement | null = null;
  let layoutComponent: ReactElement | null = null;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    if (child.type === SwitchCase) {
      if (matchedCase) return;

      const { condition } = child.props as SwitchCaseProps;

      if (condition) {
        matchedCase = child;
      }
    } else if (child.type === SwitchDefault) {
      defaultCase = child;
    } else if (child.type === SwitchLayout) {
      layoutComponent = child;
    }
  });

  let contentToRender: ReactElement | null = null;

  if (matchedCase) {
    contentToRender = cloneElement(matchedCase, { key: "matched-case" });
  } else if (defaultCase) {
    contentToRender = cloneElement(defaultCase, { key: "default-case" });
  }

  if (!contentToRender) return null;

  if (layoutComponent) {
    const { children: wrapper, withDefault = false } = (layoutComponent as ReactElement)
      .props as SwitchLayoutProps;
    // Wrap matched content always; wrap default content only when the layout opts in.
    const shouldWrap = matchedCase ? true : withDefault;

    if (shouldWrap && isValidElement(wrapper)) {
      // @ts-expect-error non-understand error
      return cloneElement(wrapper, { children: contentToRender });
    }
  }

  return <>{contentToRender}</>;
};

const Switch = Object.assign(SwitchRoot, {
  Root: SwitchRoot,
  Case: SwitchCase,
  Default: SwitchDefault,
  Layout: SwitchLayout,
});

export { Switch };
