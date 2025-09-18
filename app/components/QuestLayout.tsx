import React from 'react';

const QuestLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="quest-layout">
            <header>
                <h1>Quest Layout</h1>
            </header>
            <main>{children}</main>
            <footer>
                <p>Footer content here</p>
            </footer>
        </div>
    );
};

export default QuestLayout;
