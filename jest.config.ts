module.exports = {
    preset: 'ts-jest',                  // TypeScriptのコンパイルをts-jestに任せる
    testEnvironment: 'node',            // Node.js環境でテストを実行
    roots: ['./src'],          // テスト対象のソースコードディレクトリ
    transform: {
        '^.+\\.tsx?$': 'ts-jest',        // .ts/.tsxファイルをts-jestで処理
    },
    testMatch: [
        '**/?(*.)+(spec|test).[tj]s?(x)', // .test.ts, .spec.ts などのファイルをテスト対象にする
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js'], // 使用するファイル拡張子
    collectCoverage: true,             // テストのカバレッジを収集
    coverageDirectory: 'coverage',     // カバレッジレポートの保存先
    verbose: true,                     // テストの詳細情報を出力
};
