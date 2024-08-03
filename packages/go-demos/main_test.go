package main

import (
	"net/http"
	"reflect"
	"testing"
)

func Test_main(t *testing.T) {
	tests := []struct {
		name string
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			main()
		})
	}
}

func Test_handleUpload(t *testing.T) {
	type args struct {
		w http.ResponseWriter
		r *http.Request
	}
	tests := []struct {
		name string
		args args
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			handleUpload(tt.args.w, tt.args.r)
		})
	}
}

func Test_handleMerge(t *testing.T) {
	type args struct {
		w http.ResponseWriter
		r *http.Request
	}
	tests := []struct {
		name string
		args args
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			handleMerge(tt.args.w, tt.args.r)
		})
	}
}

func Test_addCorsHeaders(t *testing.T) {
	type args struct {
		handler http.Handler
	}
	tests := []struct {
		name string
		args args
		want http.Handler
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := addCorsHeaders(tt.args.handler); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("addCorsHeaders() = %v, want %v", got, tt.want)
			}
		})
	}
}
