import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize
} from 'rxjs';

import {
  Category,
  CategoryCreateRequest,
  CategoryUpdateRequest
} from '../../../core/models/category.model';

import {
  CategoryService
} from '../../../core/services/category';


@Component({
  selector: 'app-admin-categories',

  imports: [
    ReactiveFormsModule
  ],

  templateUrl:
    './admin-categories.html',

  styleUrl:
    './admin-categories.css'
})
export class AdminCategories
  implements OnInit {

  private readonly categoryService =
    inject(CategoryService);

  private readonly fb =
    inject(FormBuilder);


  readonly categories =
    signal<Category[]>([]);


  readonly isLoading =
    signal(true);


  readonly isSaving =
    signal(false);


  readonly deletingId =
    signal<number | null>(null);


  readonly editingCategoryId =
    signal<number | null>(null);


  readonly errorMessage =
    signal('');


  readonly successMessage =
    signal('');


  readonly categoryForm =
    this.fb.nonNullable.group({

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      description: [
        '',
        [
          Validators.maxLength(500)
        ]
      ]

    });


  ngOnInit(): void {

    this.loadCategories();

  }


  loadCategories(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');


    this.categoryService
      .getAll()
      .pipe(

        finalize(() => {

          this.isLoading.set(false);

        })

      )
      .subscribe({

        next: categories => {

          this.categories.set(
            [...categories].sort(
              (a, b) =>
                a.name.localeCompare(
                  b.name
                )
            )
          );

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to load categories.'
            )
          );

        }

      });

  }


  editCategory(
    category: Category
  ): void {

    this.editingCategoryId.set(
      category.id
    );

    this.successMessage.set('');

    this.errorMessage.set('');


    this.categoryForm.setValue({

      name:
        category.name,

      description:
        category.description ?? ''

    });


    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }


  cancelEdit(): void {

    this.editingCategoryId.set(null);

    this.categoryForm.reset({

      name: '',
      description: ''

    });

    this.errorMessage.set('');

  }


  saveCategory(): void {

    this.successMessage.set('');

    this.errorMessage.set('');


    if (
      this.categoryForm.invalid
    ) {

      this.categoryForm.markAllAsTouched();

      return;

    }


    const formValue =
      this.categoryForm.getRawValue();


    const name =
      formValue.name.trim();


    const description =
      formValue.description.trim();


    if (!name) {

      this.errorMessage.set(
        'Category name is required.'
      );

      return;

    }


    const request:
      CategoryCreateRequest |
      CategoryUpdateRequest = {

        name,

        description:
          description.length > 0
            ? description
            : null

      };


    const editingId =
      this.editingCategoryId();


    this.isSaving.set(true);


    const operation$ =
      editingId === null

        ? this.categoryService.create(
            request
          )

        : this.categoryService.update(
            editingId,
            request
          );


    operation$
      .pipe(

        finalize(() => {

          this.isSaving.set(false);

        })

      )
      .subscribe({

        next: () => {

          this.successMessage.set(

            editingId === null

              ? 'Category created successfully.'

              : 'Category updated successfully.'

          );


          this.editingCategoryId.set(
            null
          );


          this.categoryForm.reset({

            name: '',
            description: ''

          });


          this.loadCategories();

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,

              editingId === null

                ? 'Unable to create category.'

                : 'Unable to update category.'
            )
          );

        }

      });

  }


  deleteCategory(
    category: Category
  ): void {

    const confirmed =
      window.confirm(
        `Delete "${category.name}"? This action cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    this.successMessage.set('');

    this.errorMessage.set('');

    this.deletingId.set(
      category.id
    );


    this.categoryService
      .delete(
        category.id
      )
      .pipe(

        finalize(() => {

          this.deletingId.set(null);

        })

      )
      .subscribe({

        next: () => {

          this.successMessage.set(
            'Category deleted successfully.'
          );


          if (
            this.editingCategoryId()
            === category.id
          ) {

            this.cancelEdit();

          }


          this.loadCategories();

        },


        error: (
          error: HttpErrorResponse
        ) => {

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Unable to delete category.'
            )
          );

        }

      });

  }


  private getErrorMessage(
    error: HttpErrorResponse,
    fallback: string
  ): string {

    if (
      error.status === 0
    ) {

      return 'Unable to connect to the VenueFlow server. Please make sure the backend API is running.';

    }


    if (
      error.status === 401
    ) {

      return 'Your login session has expired. Please sign in again.';

    }


    if (
      error.status === 403
    ) {

      return 'You are not allowed to manage categories.';

    }


    if (
      error.status === 409
    ) {

      return (
        error.error?.message
        ||
        'This category cannot be changed because it is currently being used.'
      );

    }


    const backendMessage =
      error.error?.message;


    if (
      typeof backendMessage ===
      'string'
    ) {

      return backendMessage;

    }


    return fallback;

  }

}