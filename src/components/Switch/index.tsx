import {
  Children,
  isValidElement,
  cloneElement,
  type ReactNode,
  type ReactElement,
} from "react";

interface SwitchRootProps {
  children: ReactNode;
}

interface SwitchCaseProps {
  condition: boolean;
  children: ReactNode;
}

interface SwitchDefaultProps {
  children: ReactNode;
}

interface SwitchLayoutProps {
  children: ReactElement;
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
  let isDefaultContent = false;

  if (matchedCase) {
    contentToRender = cloneElement(matchedCase, { key: "matched-case" });
  } else if (defaultCase) {
    contentToRender = cloneElement(defaultCase, { key: "default-case" });
    isDefaultContent = true;
  }

  if (!contentToRender) return null;

  if (layoutComponent) {
    const { children: wrapper, withDefault = false } = (
      layoutComponent as ReactElement
    ).props as SwitchLayoutProps;
    const shouldWrap = !isDefaultContent || (isDefaultContent && withDefault);

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
