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

const SwitchCase = ({ children }: SwitchCaseProps) => {
  return <>{children}</>;
};

const SwitchDefault = ({ children }: SwitchDefaultProps) => {
  return <>{children}</>;
};

const SwitchRoot = ({ children }: SwitchRootProps) => {
  let defaultCase: ReactElement | null = null;
  let matchedCase: ReactElement | null = null;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    if (matchedCase) return;

    if (child.type === SwitchCase) {
      const { condition } = child.props as SwitchCaseProps;

      if (condition) {
        matchedCase = child;
      }
    } else if (child.type === SwitchDefault) {
      defaultCase = child;
    }
  });

  if (matchedCase) {
    return <>{cloneElement(matchedCase, { key: "matched-case" })}</>;
  }

  if (defaultCase) {
    return <>{cloneElement(defaultCase, { key: "default-case" })}</>;
  }

  return null;
};

const Switch = Object.assign(SwitchRoot, {
  Root: SwitchRoot,
  Case: SwitchCase,
  Default: SwitchDefault,
});

export { Switch };
