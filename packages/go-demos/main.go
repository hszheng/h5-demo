package main

import (
	"encoding/json" // 导入 JSON 包
	"fmt"           // 导入 fmt 包
	"io"            // 导入 io 包
	"net/http"      // 导入 net/http 包
	"os"            // 导入 os 包
	"path/filepath" // 导入 filepath 包
	"strconv"       // 导入 strconv 包
)

const (
	chunkSize  = 1024 * 1024 // 切片大小，这里设置为 1MB
	maxThreads = 4           // 最大线程数，这里设置为 4
	uploadDir  = "uploads"   // 上传文件存放目录
)

func main() {
	http.HandleFunc("/upload", handleUpload) // 处理上传请求
	http.HandleFunc("/merge", handleMerge)   // 处理文件合并请求
	fmt.Println("Server running on port 5500")
	http.ListenAndServe(":5500", addCorsHeaders(http.DefaultServeMux)) // 启动服务并添加 CORS 头信息
}

// 上传文件分片
func handleUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" { // 如果是 POST 请求
		file, _, err := r.FormFile("chunk") // 获取上传的文件分片
		if err != nil {
			fmt.Println(err)
			http.Error(w, "Error parsing form", http.StatusBadRequest) // 返回错误信息
			return
		}
		defer file.Close()

		chunkIndex, err := strconv.Atoi(r.FormValue("chunkIndex")) // 获取文件分片的索引
		if err != nil {
			fmt.Println(err)
			http.Error(w, "Error parsing form", http.StatusBadRequest) // 返回错误信息
			return
		}

		fileName := r.FormValue("fileName")                          // 获取文件名
		folderPath := filepath.Join(fileName)                        // 根据文件名创建文件夹路径
		if err := os.MkdirAll(folderPath, os.ModePerm); err != nil { // 创建文件夹
			fmt.Println(err)
			http.Error(w, "Error creating directory", http.StatusInternalServerError) // 返回错误信息
			return
		}

		filePath := filepath.Join(folderPath, fmt.Sprintf("%s-%d", fileName, chunkIndex)) // 根据文件名和分片索引创建文件路径
		out, err := os.Create(filePath)                                                   // 创建文件
		if err != nil {
			fmt.Println(err)
			http.Error(w, "Error creating file", http.StatusInternalServerError) // 返回错误信息
			return
		}
		defer out.Close()

		if _, err := io.Copy(out, file); err != nil { // 将文件分片写入文件
			fmt.Println(err)
			http.Error(w, "Error writing file", http.StatusInternalServerError) // 返回错误信息
			return
		}

		w.Write([]byte("Chunk uploaded")) // 返回上传成功信息
	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed) // 返回错误信息
	}
}

// 合并上传的文件分片
func handleMerge(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" { // 如果是 POST 请求
		// 解析请求体中的 JSON 数据
		var jsonData struct {
			FileName string `json:"fileName"`
		}
		if err := json.NewDecoder(r.Body).Decode(&jsonData); err != nil {
			fmt.Println(err)
			http.Error(w, "Error parsing JSON", http.StatusBadRequest) // 返回错误信息
			return
		}

		fileName := jsonData.FileName                  // 获取文件名
		folderPath := filepath.Join(fileName)          // 根据文件名创建文件夹路径
		filePath := filepath.Join(uploadDir, fileName) // 创建最终文件的路径

		out, err := os.Create(filePath) // 创建最终文件
		if err != nil {
			fmt.Println(err)
			http.Error(w, "Error creating file", http.StatusInternalServerError) // 返回错误信息
			return
		}
		defer out.Close()

		var i int
		for {
			chunkPath := filepath.Join(folderPath, fmt.Sprintf("%s-%d", fileName, i)) // 获取文件分片的路径
			if _, err := os.Stat(chunkPath); os.IsNotExist(err) {                     // 如果文件不存在
				break // 结束循环
			}
			chunkFile, err := os.Open(chunkPath) // 打开文件分片
			if err != nil {
				fmt.Println(err)
				http.Error(w, "Error opening file", http.StatusInternalServerError) // 返回错误信息
				return
			}
			defer chunkFile.Close()

			if _, err := io.Copy(out, chunkFile); err != nil { // 将文件分片写入最终文件
				fmt.Println(err)
				http.Error(w, "Error writing file", http.StatusInternalServerError) // 返回错误信息
				return
			}

			i++
		}

		if err := os.RemoveAll(folderPath); err != nil { // 删除文件夹
			fmt.Println(err)
			http.Error(w, "Error removing directory", http.StatusInternalServerError) // 返回错误信息
			return
		}

		w.Write([]byte("File uploaded")) // 返回上传成功信息
	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed) // 返回错误信息
	}
}

// 添加 CORS 头信息
func addCorsHeaders(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")                   // 设置允许跨域请求
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS") // 设置允许的请求方法
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")       // 设置允许的请求头信息
		if r.Method == "OPTIONS" {                                           // 如果是 OPTIONS 请求
			w.WriteHeader(http.StatusOK) // 返回成功状态码
			return
		}
		handler.ServeHTTP(w, r) // 处理请求
	})
}
