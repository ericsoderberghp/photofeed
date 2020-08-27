import React from "react";
import { Box, Button, CheckBox, Form, FormField, Text } from "grommet";
import { Previous, User as UserIcon } from "grommet-icons";
import { RouterContext } from "./Router";
import Screen from "./components/Screen";
import Loading from "./components/Loading";
import Controls from "./components/Controls";
import SessionContext from "./SessionContext";
import ControlButton from "./components/ControlButton";
import { apiUrl } from "./utils";

const AddUser = () => {
  const session = React.useContext(SessionContext);
  const { push } = React.useContext(RouterContext);
  const [adding, setAdding] = React.useState();
  const [user, setUser] = React.useState({
    name: "",
    email: "",
    password: "",
    admin: false,
  });
  return (
    <Screen
      controls={
        <Controls
          left={<ControlButton path="/users" Icon={Previous} />}
          label="New User"
        />
      }
    >
      {adding ? (
        <Loading Icon={UserIcon} />
      ) : (
        <Box flex={false} alignSelf="center" width="large" pad="large">
          <Form
            value={user}
            onChange={setUser}
            onSubmit={({ value }) => {
              setAdding(true);
              fetch(`${apiUrl}/users`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${session.token}`,
                  "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify(value),
              })
                .then((response) => response.json())
                .then(() => push("/users"))
                .catch(() => setAdding(false));
            }}
          >
            <FormField name="name" placeholder="name" required />
            <FormField name="email" placeholder="email" required />
            <FormField name="password" placeholder="password" />
            <FormField
              name="admin"
              pad
              component={CheckBox}
              label="administrator?"
            />
            <Box align="center" margin={{ top: "large" }}>
              {adding ? (
                <Text>Just a sec ...</Text>
              ) : (
                <Button type="submit" primary label="Add User" />
              )}
            </Box>
          </Form>
        </Box>
      )}
    </Screen>
  );
};

export default AddUser;
