import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Download, Smartphone, Sparkles, Terminal, GitBranch, Package } from 'lucide-react';
import { getFlutterSourceCode } from '../utils/flutterCode';
import { sound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FlutterCodeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dart' | 'pubspec' | 'github'>('dart');
  const [copied, setCopied] = useState(false);
  const code = getFlutterSourceCode();

  const pubspecCode = `name: auracalc
description: "AuraCalc - Apple Frosted Glass Multilingual Calculator with 3D Anatomical Life Expectancy"
publish_to: "none"
version: 1.0.0+1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`;

  const githubWorkflowCode = `name: Build Android APK

on:
  push:
    branches: [ main, master ]
    tags:
      - 'v*'
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build-apk:
    name: Build & Export Android Release APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Java 17 (JDK)
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Set up Flutter Environment
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.x'
          channel: 'stable'
          cache: true

      - name: Prepare Flutter Android Project
        run: |
          if [ -d "flutter_app" ]; then
            cd flutter_app
            flutter create --platforms=android --org com.auracalc.app .
            flutter pub get
            flutter build apk --release --no-tree-shake-icons
            cd ..
          else
            flutter create --platforms=android --org com.auracalc.app .
            flutter pub get
            flutter build apk --release --no-tree-shake-icons
          fi

      - name: Locate & Package APK
        run: |
          mkdir -p release-output
          find . -name "*.apk" -type f -exec cp {} release-output/ \\;
          if [ -f "flutter_app/build/app/outputs/flutter-apk/app-release.apk" ]; then
            cp flutter_app/build/app/outputs/flutter-apk/app-release.apk release-output/AuraCalc-v1.0.0-release.apk
          elif [ -f "build/app/outputs/flutter-apk/app-release.apk" ]; then
            cp build/app/outputs/flutter-apk/app-release.apk release-output/AuraCalc-v1.0.0-release.apk
          fi
          echo "=== Built APK Artifacts ==="
          ls -lah release-output/

      - name: Upload APK to GitHub Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: AuraCalc-Android-Release-APK
          path: release-output/*.apk
          if-no-files-found: error
          retention-days: 30
`;

  const currentDisplayCode =
    activeTab === 'dart' ? code : activeTab === 'pubspec' ? pubspecCode : githubWorkflowCode;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentDisplayCode);
      setCopied(true);
      sound.playGlassTap(1400, 0.08, 0.2);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    let filename = 'main.dart';
    if (activeTab === 'pubspec') filename = 'pubspec.yaml';
    if (activeTab === 'github') filename = 'build-apk.yml';

    const blob = new Blob([currentDisplayCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    sound.playEqualsChime();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-4xl h-[90vh] flex flex-col bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl overflow-hidden text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    Flutter APK & GitHub Release
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      v1.0.0
                    </span>
                  </h2>
                  <p className="text-xs text-white/50">
                    Ready to build release APK on GitHub Actions or local Flutter SDK
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-medium transition-all active:scale-95 cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-medium transition-all active:scale-95 shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/70 transition-colors ml-1 cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-white/10 bg-slate-950/40 text-xs">
              <button
                onClick={() => {
                  sound.playGlassTap(1000, 0.04, 0.1);
                  setActiveTab('dart');
                }}
                className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'dart'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>lib/main.dart</span>
              </button>

              <button
                onClick={() => {
                  sound.playGlassTap(1000, 0.04, 0.1);
                  setActiveTab('pubspec');
                }}
                className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'pubspec'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>pubspec.yaml (v1.0.0+1)</span>
              </button>

              <button
                onClick={() => {
                  sound.playGlassTap(1000, 0.04, 0.1);
                  setActiveTab('github');
                }}
                className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'github'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>GitHub Actions APK Workflow</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Setup Instructions on the Left */}
              <div className="w-full md:w-80 p-5 border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.02] flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2.5 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      How to Build Release APK
                    </h3>
                    <ol className="text-xs text-white/70 space-y-2.5 list-decimal pl-4">
                      <li>
                        Push changes to GitHub:
                        <div className="p-2 my-1 rounded-lg bg-black/60 font-mono text-[11px] text-cyan-300 border border-white/10">
                          git push origin main
                        </div>
                      </li>
                      <li>
                        GitHub Actions will run <code className="text-amber-300 font-mono">build-apk.yml</code> automatically.
                      </li>
                      <li>
                        <strong className="text-white">Download APK on GitHub:</strong>
                        <div className="p-2 my-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200 space-y-1">
                          <div>1. Go to your GitHub repository</div>
                          <div>2. Click the <span className="font-bold underline">Actions</span> tab at top</div>
                          <div>3. Select latest <span className="font-bold underline">Build Android APK</span> run</div>
                          <div>4. Scroll down to <span className="font-bold underline">Artifacts</span></div>
                          <div>5. Click <span className="font-bold text-white underline">AuraCalc-Android-APK</span> to download!</div>
                        </div>
                      </li>
                      <li>
                        Or build locally with single terminal command:
                        <div className="p-2 my-1 rounded-lg bg-black/60 font-mono text-[11px] text-emerald-300 border border-emerald-500/30">
                          flutter build apk --release
                        </div>
                      </li>
                      <li>
                        Local APK Output Location:
                        <div className="p-2 my-1 rounded-lg bg-black/60 font-mono text-[10px] text-white/80 border border-white/10 break-all">
                          build/app/outputs/flutter-apk/app-release.apk
                        </div>
                      </li>
                    </ol>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                    <div className="text-xs font-medium text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      App Metadata
                    </div>
                    <div className="text-[11px] text-white/60 font-mono space-y-0.5">
                      <div>Name: AuraCalc</div>
                      <div>Package: com.auracalc.app</div>
                      <div>Version: 1.0.0 (Build 1)</div>
                      <div>Min SDK: Android 21+ (Lollipop)</div>
                      <div>Target SDK: Android 34+ (Android 14)</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-white/40">
                  Ready for Google Play Store upload or direct APK installation on any Android phone.
                </div>
              </div>

              {/* Code viewer */}
              <div className="flex-1 bg-black/60 p-4 overflow-auto font-mono text-xs text-cyan-100/90 leading-relaxed selection:bg-cyan-500/30">
                <pre>{currentDisplayCode}</pre>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
