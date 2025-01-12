import Sidebar from "./Sidebar";
import { useState } from "react";

const Layout = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleSidebarToggle = (collapsed) => {
        setIsCollapsed(collapsed);
    };

    return (
        <div className="flex">
            <Sidebar onToggle={handleSidebarToggle} />
            <main
                className={`transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"
                    } pl-4 flex-1`}
            >
                {children}
            </main>
        </div>
    );
};

export default Layout;
