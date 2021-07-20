interface AuthContextType {
    auth: boolean,
    guest?: boolean,
    username?: string,
    token?: string,
    socket?: any,  // TODO socket type
    callbacks?: {
        login: any,
        signup: any,
        logout: any,
    },  // TODO function (promise?) type
};

export default AuthContextType;