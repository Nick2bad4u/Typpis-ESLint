import PropTypes from "prop-types";
// @ts-nocheck
import { memo, useMemo } from "react";

function ExampleComponent({ name }) {
  const message = useMemo(() => `Hello ${name}`.trim(), [name]);
  const welcome = "Welcome to the Typpis ESLint playground.";

  return (
    <main data-testid="greeting-container">
      <section aria-label="Greeting" data-testid="greeting-content">
        <p data-testid="greeting-message">{message}</p>
        <p aria-live="polite" data-testid="greeting-welcome">
          {welcome}
        </p>
      </section>
    </main>
  );
}

ExampleComponent.propTypes = {
  name: PropTypes.string.isRequired,
};

export const Example = memo(ExampleComponent);
Example.displayName = "Example";

export default Example;
export { Example as example };
