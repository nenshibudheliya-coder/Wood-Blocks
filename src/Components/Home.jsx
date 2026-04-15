import React from 'react';
import '../css/Home.css';

export default function Home({ onPlay }) {
    return (
        <div className="home-container">
            {/* Logo Container */}
            <div className="logo-container">
                {/* Top Shield/Frame */}
                <div className="logo-frame-top">
                    <span className="logo-text">Wood</span>
                </div>

                {/* Banner/Ribbon */}
                <div className="logo-banner">
                    <span className="logo-banner-text">Blocks</span>
                </div>

                {/* Bottom Frame Base */}
                <div className="logo-frame-base" />
            </div>

            {/* Play Button Container */}
            <div className="play-btn-wrapper" onClick={onPlay}>
                {/* 3D Wood Button */}
                <div className="play-btn">
                    <svg viewBox="0 0 24 24" className="play-icon">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>

                {/* Button Base Shadow */}
                <div className="play-shadow" />
            </div>

            {/* Background Decorative Elements */}
            <div className="decor-top-left">🧩</div>
            <div className="decor-bottom-right">🍂</div>
        </div>
    );
}
