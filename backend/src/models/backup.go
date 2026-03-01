package models

type BackupData struct {
Articles []*Article      `json:"articles"`
About    *AboutData      `json:"about"`
Messages []*ContactMessage `json:"messages"`
}
