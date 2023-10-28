import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const PROTO_FILE = './proto/user.proto';

async function main() {
    const packageDefinition = protoLoader.loadSync(PROTO_FILE, {
        keepCase: true,
        longs: String,
        enums: String,
        arrays: true,
    });

    const userProto = grpc.loadPackageDefinition(packageDefinition);
    const server = new grpc.Server();

    let users = [
        { name: "Luis Armijos", email: "larmijos@ups.edu.ec", age: 48 }
    ];

    server.addService(userProto.UserService.service, {
        getUsers: (_, callback) => {
            console.log('Recibida solicitud para getUsers');
            console.log('Usuarios actuales:', users);

            if (users.length > 0) {
                callback(null, { Users: users });
            } else {
                callback({
                    code: grpc.status.NOT_FOUND,
                    details: 'No users found',
                });
            }
        },
        addUser: (call, callback) => {
            const user = call.request;

            console.log('Recibida solicitud para addUser con datos:', user);

            users.push(user);

            console.log('Usuarios actualizados:', users);

            callback(null, user);
        }
    });

    await server.bindAsync(
        '127.0.0.1:3043',
        grpc.ServerCredentials.createInsecure(),
        () => {
            server.start();
            console.log('Server RPC on port 3043');
        }
    );
}

main();

