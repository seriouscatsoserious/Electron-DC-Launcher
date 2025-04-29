const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

class EnforcerClient {
  constructor() {
    let packageDefinition;
    let isDev, basePath, protoPath;

    try {
      // Load the proto file
      isDev = process.env.NODE_ENV === 'development' || !process.resourcesPath;
      
      // Try multiple possible locations for the proto file
      const possiblePaths = [
        // Development path
        path.join(__dirname, '../..', 'src/data/proto/cusf/mainchain/v1/validator.proto'),
        // Production path in app.asar
        process.resourcesPath ? path.join(process.resourcesPath, 'app.asar', 'src/data/proto/cusf/mainchain/v1/validator.proto') : null,
        // Fallback to local proto
        path.join(__dirname, 'validator.proto')
      ].filter(Boolean);

      let loadError;
      for (const tryPath of possiblePaths) {
        try {
          const includeDir = path.dirname(path.dirname(path.dirname(path.dirname(tryPath))));
          
          packageDefinition = protoLoader.loadSync(tryPath, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
            includeDirs: [includeDir]
          });
          
          if (packageDefinition) {
            protoPath = tryPath;
            break;
          }
        } catch (e) {
          loadError = e;
          console.log('Failed to load from', tryPath, ':', e.message);
        }
      }

      if (!packageDefinition) {
        throw loadError || new Error('Failed to load proto from any location');
      }
    } catch (error) {
      console.error('Failed to load proto file:', error);
      console.error('Environment:', {
        isDev,
        triedPaths: possiblePaths,
        protoPath,
        resourcesPath: process.resourcesPath,
        currentDir: __dirname
      });
      console.error('Proto dependencies:', {
        grpcJs: require.resolve('@grpc/grpc-js'),
        protoLoader: require.resolve('@grpc/proto-loader')
      });
      throw error;
    }

    try {
      // Load the ValidatorService package
      const proto = grpc.loadPackageDefinition(packageDefinition);
      if (!proto.cusf?.mainchain?.v1?.ValidatorService) {
        throw new Error('ValidatorService not found in proto definition');
      }
      const validatorService = proto.cusf.mainchain.v1.ValidatorService;

      // Create the client
      this.client = new validatorService(
        'localhost:50051', // Default gRPC port, adjust if needed
        grpc.credentials.createInsecure()
      );
    } catch (error) {
      console.error('Failed to create gRPC client:', error);
      throw error;
    }
  }

  async getBlockCount() {
    return new Promise((resolve, reject) => {
      this.client.getChainTip({}, (error, response) => {
        if (error) {
          reject(error);
          return;
        }
        
        // Response contains BlockHeaderInfo with height field
        resolve(response.block_header_info.height);
      });
    });
  }
}

module.exports = EnforcerClient;
