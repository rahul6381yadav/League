import './App.css';
import Login from './components/auth/Login';

function App() {
  return (
    <>
      <iframe
        src="/background.html"  // Path to the HTML file in the public folder
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          border: "none",
          zIndex: -1,  // Ensures the background stays behind the content
        }}
        title="Background Design"
      />
      <Login></Login>
    </>
  );
}

export default App;
