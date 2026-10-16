import { Center, Heading, Text } from "@chakra-ui/react";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Change to reset after a failure (e.g. resource type + url). */
  resetKey?: string | number;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Isolates lazy viewer chunk failures so one viewer can't white-screen the app. */
export default class ViewerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: unknown) {
    console.error("Viewer failed to load/render:", error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <Center
          width={{ base: "100%", sm: "75%", md: "65%", lg: "50%" }}
          aspectRatio={16 / 9}
          flexDirection="column"
          rowGap="5px"
          backgroundColor="bg"
          marginInline="auto"
        >
          <Heading>500</Heading>
          <Text>تعذر تحميل العارض، أعد المحاولة رجاءً</Text>
        </Center>
      );
    }
    return this.props.children;
  }
}
