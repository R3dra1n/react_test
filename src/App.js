import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [apiToken, setApiToken] = useState(""); // 用户输入的 API Token
  const [file, setFile] = useState(null); // 上传的文件
  const [fileUrl, setFileUrl] = useState(""); // 文件上传后的URL
  const [productType, setProductType] = useState(""); // 产品类型
  const [taskID, setTaskID] = useState(""); // 任务ID
  const [textResults, setTextResults] = useState([]); // 解析后的 text 部分

  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
    header: {
      textAlign: "center",
      marginBottom: "20px",
      color: "#333",
    },
    section: {
      marginBottom: "20px",
    },
    button: {
      padding: "10px 15px",
      backgroundColor: "#007BFF",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
    },
    buttonDisabled: {
      backgroundColor: "#ccc",
      cursor: "not-allowed",
    },
    dropdown: {
      width: "100%",
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "14px",
    },
    result: {
      marginBottom: "20px",
      padding: "15px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      backgroundColor: "#f9f9f9",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    title: {
      fontSize: "16px",
      fontWeight: "bold",
      marginBottom: "10px",
      color: "#333",
    },
    text: {
      marginBottom: "10px",
    },
  };

  // 上传文件
  const handleUploadFile = async () => {
    if (!apiToken) {
      alert("请先输入 API Token！");
      return;
    }
    if (!file) {
      alert("请先选择文件！");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "https://kw-api.adlawai.com/api/v1/upload-file",
        formData,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFileUrl(res.data.url);
      alert(`文件上传成功: ${res.data.url}`);
    } catch (error) {
      console.error("文件上传失败:", error);
      alert("文件上传失败，请检查！");
    }
  };

  // 提交任务
  const handleSubmitTask = async () => {
    if (!apiToken) {
      alert("请先输入 API Token！");
      return;
    }
    if (!fileUrl || !productType) {
      alert("请确保文件已上传并选择了产品类型！");
      return;
    }

    const data = {
      file_url: fileUrl,
      product_type: productType,
      callback_url: "",
      callback_headers: {},
      custom_params: {},
    };

    try {
      const res = await axios.post(
        "https://kw-api.adlawai.com/api/v1/process-file",
        data,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setTaskID(res.data.task_id);
      alert(`任务提交成功: 任务ID ${res.data.task_id}`);
      handleQueryTask(res.data.task_id);
    } catch (error) {
      console.error("任务提交失败:", error);
      alert("任务提交失败，请检查！");
    }
  };

  // 查询任务结果
  const handleQueryTask = async (id = taskID) => {
    if (!apiToken) {
      alert("请先输入 API Token！");
      return;
    }
    if (!id) {
      alert("请先提交任务！");
      return;
    }

    try {
      const res = await axios.get(
        `https://kw-api.adlawai.com/api/v1/tasks/${id}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      const { status, result } = res.data;

      if (status === "SUCCESS" && result && result.review_results) {
        const textResults = result.review_results.text || [];
        setTextResults(textResults); // 保存解析出的 text 部分
      } else {
        alert(`任务状态: ${status}`);
      }
    } catch (error) {
      console.error("查询任务失败:", error);
      alert("查询任务失败，请检查！");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>文件处理 API 测试界面</h1>

      {/* 输入 API Token */}
      <div style={styles.section}>
        <h2>输入 API Token</h2>
        <input
          type="text"
          placeholder="请输入 API Token"
          value={apiToken}
          onChange={(e) => setApiToken(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px", fontSize: "14px" }}
        />
      </div>

      {/* 文件上传 */}
      <div style={styles.section}>
        <h2>1. 上传文件</h2>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button
          onClick={handleUploadFile}
          style={
            fileUrl ? { ...styles.button, ...styles.buttonDisabled } : styles.button
          }
          disabled={!!fileUrl}
        >
          {fileUrl ? "文件已上传" : "上传文件"}
        </button>
        <div>
          <strong>文件URL:</strong> {fileUrl}
        </div>
      </div>

      {/* 提交任务 */}
      <div style={styles.section}>
        <h2>2. 提交任务</h2>
        <label>产品类型:</label>
        <select
          value={productType}
          onChange={(e) => setProductType(e.target.value)}
          style={styles.dropdown}
        >
          <option value="">请选择</option>
          <option value="酒类">酒类</option>
          <option value="普通食品">普通食品</option>
          <option value="保健食品">保健食品</option>
        </select>
        <button onClick={handleSubmitTask} style={styles.button}>
          提交任务
        </button>
        <div>
          <strong>任务ID:</strong> {taskID}
        </div>
      </div>

      {/* 查询任务 */}
      <div style={styles.section}>
        <h2>3. 查询任务结果</h2>
        <button onClick={() => handleQueryTask()} style={styles.button}>
          查询任务结果
        </button>
      </div>

      {/* 响应结果 */}
      <div style={styles.section}>
        <h2>响应结果</h2>
        {textResults.length > 0 ? (
          textResults.map((item, index) => (
            <div key={index} style={styles.result}>
              <p style={styles.title}>结果 {index + 1}</p>
              <p style={styles.text}><strong>内容:</strong> {item.content}</p>
              <p style={styles.text}><strong>关键词:</strong> {item.wording.join(", ")}</p>
              <p style={styles.text}><strong>结论:</strong> {item.conclusion}</p>
              <p style={styles.text}><strong>原因:</strong> {item.reason}</p>
              <p style={styles.text}><strong>条款:</strong> {item.provision}</p>
            </div>
          ))
        ) : (
          <p>暂无结果。</p>
        )}
      </div>
    </div>
  );
};

export default App;