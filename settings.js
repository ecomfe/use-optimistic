/* eslint-disable import/unambiguous, import/no-commonjs, import/no-nodejs-modules */
exports.featureMatrix = {
    stable: {},
    dev: {},
};

exports.build = {
    appTitle: 'Use Optimistic',
};

exports.devServer = {
    port: 9011,
    hot: 'all',
};

// exports.addition = ({usage}) => {
//     if (usage === 'build') {
//         return {
//             output: {
//                 publicPath: '/react-suspense-boundary/assets/',
//             },
//         };
//     }

//     return {};
// };

exports.addition = () => ({});
