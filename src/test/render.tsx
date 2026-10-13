import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UnknownAction } from "@reduxjs/toolkit";
import type { ReactElement, ReactNode } from "react";
import { Provider } from "react-redux";
import { MemoryRouter, useLocation } from "react-router-dom";
import { makeStore, type AppStore, type RootState } from "@/app/store";

interface ProviderOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: Partial<RootState>;
  actions?: UnknownAction[];
  store?: AppStore;
  route?: string;
}

function CurrentPath() {
  return <output data-testid="current-path">{useLocation().pathname}</output>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    actions = [],
    store = makeStore(preloadedState),
    route = "/",
    ...options
  }: ProviderOptions = {},
) {
  actions.forEach((action) => store.dispatch(action));

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          {children}
          <CurrentPath />
        </MemoryRouter>
      </Provider>
    );
  }

  return { store, user: userEvent.setup(), ...render(ui, { wrapper: Wrapper, ...options }) };
}
