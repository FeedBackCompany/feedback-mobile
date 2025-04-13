import Profile from "./Profile";

export default function PublicProfile({ route, navigation }: any) {
    console.log(route);

    return (
        <Profile route={route} navigation={navigation} />
    )
}