import { StyleSheet } from "react-native";
import { DifficultyDrawer } from "../app/components/DifficultyDrawer";

it("covers the screen with a dismissible difficulty backdrop", () => {
  const onClose = jest.fn();
  // This stateless component returns Modal > container > backdrop.
  const drawer = DifficultyDrawer({
    visible: true,
    onClose,
    onSelect: jest.fn(),
  }) as React.ReactElement<any>;
  const backdrop = drawer.props.children.props.children[0];
  expect(StyleSheet.flatten(backdrop.props.style)).toMatchObject({
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  backdrop.props.onPress();
  expect(onClose).toHaveBeenCalledTimes(1);
});
