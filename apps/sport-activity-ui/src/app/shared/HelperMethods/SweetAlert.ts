import Swal from 'sweetalert2';
export class SweetAlert {
  static showSuccessAlert(message: string): void {
    Swal.fire({
      title: 'Yes!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  static showErrorAlert(message: string): void {
    Swal.fire({
      title: 'Oops..',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }

  static showWarningAlert(message: string): void {
    Swal.fire({
      title: 'Pas op!',
      text: message,
      icon: 'warning',
      confirmButtonText: 'OK',
    });
  }

  static showInfoAlert(message: string): void {
    Swal.fire({
      title: 'Informatie',
      text: message,
      icon: 'info',
      confirmButtonText: 'OK',
    });
  }
}
